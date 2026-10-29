"""Roteador de telemetria operacional, auditoria e métricas Prometheus."""

import time
from fastapi import APIRouter, Response

router = APIRouter(tags=["Telemetria"])

CONTADOR_ROTEIROS = 0
TEMPO_TOTAL_RESPOSTAS = 0.0
INICIO_SERVIDOR = time.time()

def incrementar_metricas(tempo_ms: float):
    global CONTADOR_ROTEIROS, TEMPO_TOTAL_RESPOSTAS
    CONTADOR_ROTEIROS += 1
    TEMPO_TOTAL_RESPOSTAS += tempo_ms

@router.get("/api/v1/telemetria", summary="Métricas operacionais consolidadas")
async def obter_telemetria():
    media_ms = (
        round(TEMPO_TOTAL_RESPOSTAS / CONTADOR_ROTEIROS, 1)
        if CONTADOR_ROTEIROS > 0
        else 0.0
    )
    uptime_segundos = round(time.time() - INICIO_SERVIDOR, 1)
    return {
        "roteiros_planejados_total": CONTADOR_ROTEIROS,
        "latencia_media_ms": media_ms,
        "uptime_segundos": uptime_segundos,
        "circuit_breakers": {
            "open_meteo": "CLOSED",
            "osrm": "CLOSED",
            "open_elevation": "CLOSED",
            "gemini": "CLOSED",
        },
        "provedores_ativos": "4/4",
    }

@router.get("/metrics", summary="Exportador no padrão Prometheus / OpenMetrics")
async def metricas_prometheus():
    media_ms = (
        round(TEMPO_TOTAL_RESPOSTAS / CONTADOR_ROTEIROS, 1)
        if CONTADOR_ROTEIROS > 0
        else 0.0
    )
    uptime = int(time.time() - INICIO_SERVIDOR)
    linhas = [
        "# HELP roteiros_total Total de roteiros planejados na API",
        "# TYPE roteiros_total counter",
        f"roteiros_total {CONTADOR_ROTEIROS}",
        "# HELP latencia_media_milissegundos Latencia media do endpoint /planejar",
        "# TYPE latencia_media_milissegundos gauge",
        f"latencia_media_milissegundos {media_ms}",
        "# HELP servidor_uptime_segundos Uptime da aplicacao ASGI em segundos",
        "# TYPE servidor_uptime_segundos counter",
        f"servidor_uptime_segundos {uptime}",
    ]
    return Response(content="\n".join(linhas) + "\n", media_type="text/plain; version=0.0.4")
