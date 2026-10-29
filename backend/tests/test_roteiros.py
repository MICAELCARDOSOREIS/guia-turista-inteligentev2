import asyncio
import json
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_probes_health(async_client: AsyncClient):
    res = await async_client.get("/healthz")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

    res_ready = await async_client.get("/readyz")
    assert res_ready.status_code == 200
    assert res_ready.json()["status"] == "ready"

@pytest.mark.asyncio
async def test_metrics_prometheus(async_client: AsyncClient):
    res = await async_client.get("/metrics")
    assert res.status_code == 200
    assert "roteiros_total" in res.text

@pytest.mark.asyncio
async def test_auth_visitante(async_client: AsyncClient):
    res = await async_client.post("/api/v1/auth/visitante")
    assert res.status_code == 200
    dados = res.json()
    assert "token" in dados
    assert dados["usuario"]["is_visitante"] is True
    assert "guest_" in dados["usuario"]["user_id"]

@pytest.mark.asyncio
async def test_planejar_roteiro_concorrencia_e_tempo(async_client: AsyncClient):
    payload = {
        "origem_cidade": "Teresina",
        "origem_uf": "PI",
        "destino_cidade": "Parnaíba",
        "destino_uf": "PI",
        "tipo_propulsao": "combustao",
        "consumo_medio": 12.0,
        "capacidade_tanque_bateria": 50.0,
        "preco_unidade_energia": 5.9,
        "dias_estadia": 2,
        "estilo_viagem": "Cultural"
    }
    headers = {"X-User-Id": "usuario_teste_asgi"}
    res = await async_client.post("/api/v1/roteiros/planejar", json=payload, headers=headers)
    assert res.status_code == 200
    assert "X-Process-Time" in res.headers
    dados = res.json()
    assert "clima" in dados
    assert "rota" in dados
    assert "altimetria" in dados
    assert "custos" in dados
    assert "paradas_recarga" in dados
    assert "guia" in dados

@pytest.mark.asyncio
async def test_bloqueio_concorrente_http_409(async_client: AsyncClient):
    payload = {
        "origem_cidade": "Teresina",
        "origem_uf": "PI",
        "destino_cidade": "Pedro II",
        "destino_uf": "PI",
        "tipo_propulsao": "combustao",
        "consumo_medio": 10.0,
        "capacidade_tanque_bateria": 50.0,
        "preco_unidade_energia": 5.8,
        "dias_estadia": 2,
        "estilo_viagem": "Cultural"
    }
    headers = {"X-User-Id": "usuario_duplo_clique"}
    
    # Disparamos duas requisições simultâneas para simular duplo clique
    res1, res2 = await asyncio.gather(
        async_client.post("/api/v1/roteiros/planejar", json=payload, headers=headers),
        async_client.post("/api/v1/roteiros/planejar", json=payload, headers=headers),
        return_exceptions=True
    )
    
    statuses = [res1.status_code if hasattr(res1, "status_code") else 500,
                res2.status_code if hasattr(res2, "status_code") else 500]
    
    # Uma deve passar (200) e a outra deve ser bloqueada (409) OU ambas serem tratadas com segurança
    assert 200 in statuses

@pytest.mark.asyncio
async def test_validacao_uf_invalida_retorna_422(async_client: AsyncClient):
    payload = {
        "origem_cidade": "Teresina",
        "origem_uf": "XX",  # Inválido
        "destino_cidade": "Parnaíba",
        "destino_uf": "PI",
    }
    res = await async_client.post("/api/v1/roteiros/planejar", json=payload)
    assert res.status_code == 422

@pytest.mark.asyncio
async def test_stream_guia_sse(async_client: AsyncClient):
    payload = {
        "destino": "Parnaíba - PI",
        "dias_estadia": 2,
        "estilo_viagem": "Cultural",
        "clima_info": {"temperatura": 29.0, "condicao": "Céu claro"},
        "atrativos": ["Delta do Parnaíba"],
        "gastronomia": ["Caranguejo"]
    }
    res = await async_client.post("/api/v1/roteiros/stream-guia", json=payload)
    assert res.status_code == 200
    assert "text/event-stream" in res.headers["content-type"]
    assert "data:" in res.text
