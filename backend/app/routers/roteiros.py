"""Roteador principal de planejamento de viagens, mapas, SSE e persistência."""

import asyncio
import json
import time
import uuid
from typing import Any
import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response, status
from fastapi.responses import StreamingResponse

from app.core.catalogo import DESTINOS_CATALOGO
from app.core.dependencies import obter_http_client, obter_usuario_ativo
from app.routers.telemetria import incrementar_metricas
from app.schemas.roteiros import (
    CompartilharRequest,
    CustosRequest,
    GuiaStreamRequest,
    MapaRotaRequest,
    RoteiroRequest,
    VisitaPatchRequest,
)
from app.services.altimetria_service import obter_perfil_altimetrico_async
from app.services.clima_service import buscar_coordenadas_async, obter_clima_async
from app.services.custos_service import calcular_custos_viagem
from app.services.gemini_service import gerar_guia_ia_async, gerar_guia_ia_stream_async
from app.services.gpx_service import gerar_xml_gpx
from app.services.postos_service import calcular_paradas_autonomia
from app.services.rota_service import calcular_rota_osrm_async
from app.services.storage_service import (
    atualizar_visita_atrativo,
    listar_viagens_usuario,
    remover_viagem,
    salvar_nova_viagem,
)

router = APIRouter(prefix="/roteiros", tags=["Roteiros Turísticos"])

REQUISICOES_ATIVAS: set[str] = set()
lock_requisicoes = asyncio.Lock()

async def despachar_compartilhamento_background(roteiro_id: str, canal: str, destinatario: str):
    """Execução assíncrona em segundo plano de webhooks de notificação."""
    await asyncio.sleep(0.1)
    # Log estruturado ou integração externa
    print(f"[BACKGROUND] Notificação do roteiro {roteiro_id} despachada via {canal} para {destinatario}.")


@router.post("/planejar", summary="Orquestração assíncrona concorrente de roteiros")
async def planejar_roteiro(
    payload: RoteiroRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    client: httpx.AsyncClient = Depends(obter_http_client),
    user_id_ativo: str = Depends(obter_usuario_ativo),
):
    inicio_req = time.perf_counter()

    # 1. Detecção precoce de cancelamento do cliente
    if await request.is_disconnected():
        raise HTTPException(status_code=499, detail="Requisição cancelada pelo cliente.")

    # 2. Bloqueio de concorrência e idempotência contra cliques simultâneos duplicados
    chave_requisicao = f"{user_id_ativo}:{payload.origem_cidade}_{payload.origem_uf}->{payload.destino_cidade}_{payload.destino_uf}".lower().strip()
    async with lock_requisicoes:
        if chave_requisicao in REQUISICOES_ATIVAS:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Já existe uma requisição em andamento para este mesmo roteiro. Aguarde a conclusão da consulta ativa.",
            )
        REQUISICOES_ATIVAS.add(chave_requisicao)

    try:
        # Estágio 1: Geocodificação paralela de Origem e Destino
        (lat_o, lon_o, nome_o), (lat_d, lon_d, nome_d) = await asyncio.gather(
            buscar_coordenadas_async(client, payload.origem_cidade, payload.origem_uf),
            buscar_coordenadas_async(client, payload.destino_cidade, payload.destino_uf),
        )

        if await request.is_disconnected():
            raise HTTPException(status_code=499, detail="Requisição cancelada pelo cliente.")

        # Estágio 2: Orquestração concorrente de Clima e Rota rodoviária OSRM
        dados_clima, dados_percurso = await asyncio.gather(
            obter_clima_async(client, lat_d, lon_d),
            calcular_rota_osrm_async(
                client, lat_o, lon_o, lat_d, lon_d, preferencia_rota=payload.preferencia_rota
            ),
        )

        distancia_km = dados_percurso["distancia_km"]
        coords = dados_percurso["coordinates"]

        # Estágio 3: Altimetria e postos
        altimetria = await obter_perfil_altimetrico_async(client, coords, distancia_km)

        autonomia_km = payload.consumo_medio * payload.capacidade_tanque_bateria
        paradas = calcular_paradas_autonomia(
            distancia_km=distancia_km,
            tipo_propulsao=payload.tipo_propulsao,
            autonomia_nominal_km=autonomia_km,
            coordinates=coords,
        )

        # Custos
        custos = calcular_custos_viagem(
            distancia_km=distancia_km,
            tipo_propulsao=payload.tipo_propulsao,
            consumo_medio=payload.consumo_medio,
            preco_unidade=payload.preco_unidade_energia,
            uf_origem=payload.origem_uf,
            uf_destino=payload.destino_uf,
            num_passageiros=1,
            penalizacao_altimetrica_pct=altimetria["penalizacao_consumo_pct"],
        )

        # Destinos curados
        atrativos = []
        gastronomia = []
        for d in DESTINOS_CATALOGO:
            if d["cidade"].lower() in payload.destino_cidade.lower():
                atrativos = d["atrativos"]
                gastronomia = d["gastronomia"]
                break

        # Síntese inicial de guia
        guia_texto, diag_ia = await gerar_guia_ia_async(
            destino=nome_d,
            dias_estadia=payload.dias_estadia,
            estilo_viagem=payload.estilo_viagem,
            clima_info=dados_clima,
            atrativos=atrativos,
            gastronomia=gastronomia,
        )

        roteiro_id = f"rot_{uuid.uuid4().hex[:10]}"
        resultado = {
            "id": roteiro_id,
            "origem": nome_o,
            "destino": nome_d,
            "origem_coords": {"lat": lat_o, "lon": lon_o},
            "destino_coords": {"lat": lat_d, "lon": lon_d},
            "clima": dados_clima,
            "rota": dados_percurso,
            "altimetria": altimetria,
            "custos": custos,
            "paradas_recarga": paradas,
            "atrativos_sugeridos": atrativos,
            "gastronomia_sugerida": gastronomia,
            "atrativos_visitados": [],
            "guia": guia_texto,
            "diagnostico_ia": diag_ia,
            "criado_em": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }

        # BackgroundTasks: persistência atômica da viagem sem atrasar a resposta
        if not await request.is_disconnected():
            background_tasks.add_task(salvar_nova_viagem, user_id=user_id_ativo, roteiro=resultado)

        tempo_total_ms = (time.perf_counter() - inicio_req) * 1000.0
        incrementar_metricas(tempo_total_ms)

        return resultado

    finally:
        async with lock_requisicoes:
            REQUISICOES_ATIVAS.discard(chave_requisicao)


@router.post("/mapa-rota", summary="Consulta de traçado e paradas estratégicas")
async def obter_mapa_rota(
    payload: MapaRotaRequest,
    client: httpx.AsyncClient = Depends(obter_http_client),
):
    dados_percurso = await calcular_rota_osrm_async(
        client, payload.origem_lat, payload.origem_lon, payload.destino_lat, payload.destino_lon
    )
    paradas = calcular_paradas_autonomia(
        distancia_km=dados_percurso["distancia_km"],
        tipo_propulsao=payload.tipo_propulsao,
        autonomia_nominal_km=payload.autonomia_nominal_km,
        coordinates=dados_percurso["coordinates"],
    )
    return {
        "rota": dados_percurso,
        "paradas_recarga": paradas,
    }


@router.post("/stream-guia", summary="Geração de Guia por IA em Streaming (SSE)")
async def stream_guia_ia(payload: GuiaStreamRequest, request: Request):
    """Endpoint de Server-Sent Events (SSE) para transmissão em tempo real do guia."""
    async def evento_generator():
        try:
            async for chunk in gerar_guia_ia_stream_async(
                destino=payload.destino,
                dias_estadia=payload.dias_estadia,
                estilo_viagem=payload.estilo_viagem,
                clima_info=payload.clima_info,
                atrativos=payload.atrativos,
                gastronomia=payload.gastronomia,
            ):
                if await request.is_disconnected():
                    break
                payload_sse = json.dumps({"chunk": chunk, "done": False}, ensure_ascii=False)
                yield f"data: {payload_sse}\n\n"

            # Evento sinalizador de término
            yield f"data: {json.dumps({'chunk': '', 'done': True})}\n\n"
        except Exception as exc:
            erro_sse = json.dumps({"chunk": f"\n\n[Erro no streaming: {exc}]", "done": True})
            yield f"data: {erro_sse}\n\n"

    return StreamingResponse(
        evento_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/custos", summary="Calculadora dinâmica de custos e rateio")
async def calcular_custos(payload: CustosRequest):
    return calcular_custos_viagem(
        distancia_km=payload.distancia_km,
        tipo_propulsao=payload.tipo_propulsao,
        consumo_medio=payload.consumo_medio,
        preco_unidade=payload.preco_unidade,
        uf_origem=payload.uf_origem,
        uf_destino=payload.uf_destino,
        num_passageiros=payload.num_passageiros,
    )


@router.get("/exportar/gpx", summary="Download de arquivo GPX 1.1")
async def exportar_gpx(
    origem: str = "Origem",
    destino: str = "Destino",
    distancia_km: float = 300.0,
):
    coords = [(-42.8016, -5.0892), (-41.7766, -2.9038)]
    conteudo_gpx = gerar_xml_gpx(origem, destino, coords)
    return Response(
        content=conteudo_gpx,
        media_type="application/gpx+xml",
        headers={"Content-Disposition": f'attachment; filename="itinerario-{origem}-para-{destino}.gpx"'},
    )


@router.get("/minhas-viagens", summary="Lista viagens salvas do usuário ativo")
async def minhas_viagens(user_id_ativo: str = Depends(obter_usuario_ativo)):
    return listar_viagens_usuario(user_id_ativo)


@router.delete("/{roteiro_id}", summary="Exclusão pontual de viagem")
async def excluir_viagem(roteiro_id: str, user_id_ativo: str = Depends(obter_usuario_ativo)):
    sucesso = remover_viagem(user_id_ativo, roteiro_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Roteiro não encontrado para exclusão.")
    return {"status": "ok", "mensagem": "Roteiro excluído com sucesso."}


@router.patch("/{roteiro_id}/visitas", summary="Marcação de atrativos turísticos visitados")
async def marcar_visita(
    roteiro_id: str,
    payload: VisitaPatchRequest,
    user_id_ativo: str = Depends(obter_usuario_ativo),
):
    sucesso = atualizar_visita_atrativo(user_id_ativo, roteiro_id, payload.atrativo, payload.visitado)
    return {"status": "ok", "visitado": payload.visitado, "atualizado": sucesso}


@router.post("/compartilhar", summary="Compartilhamento em segundo plano")
async def compartilhar_roteiro(
    roteiro_id: str,
    payload: CompartilharRequest,
    background_tasks: BackgroundTasks,
):
    background_tasks.add_task(
        despachar_compartilhamento_background,
        roteiro_id=roteiro_id,
        canal=payload.canal,
        destinatario=payload.destinatario or "contato@guiadoturista.com.br",
    )
    return {"status": "ok", "mensagem": f"Compartilhamento via {payload.canal} despachado em segundo plano."}
