"""Instância principal da API FastAPI - Guia do Turista Inteligente v2."""

import time
import uuid
from contextlib import asynccontextmanager
import httpx
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.logging_config import setup_logging
from app.routers import auth, roteiros, telemetria

settings = get_settings()
setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerenciamento de recursos no ciclo de vida da aplicação (Connection Pool HTTP)."""
    limits = httpx.Limits(max_keepalive_connections=50, max_connections=200)
    timeout = httpx.Timeout(10.0, connect=4.0)
    client = httpx.AsyncClient(limits=limits, timeout=timeout)
    app.state.http_client = client
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    yield
    await client.aclose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API REST ASGI de alta performance para o Guia do Turista Inteligente v2",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# 1. Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time", "X-Request-ID"],
)

# 2. Middleware de Telemetria e Latência
@app.middleware("http")
async def process_time_and_correlation_middleware(request: Request, call_next):
    inicio = time.perf_counter()
    req_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
    
    try:
        response: Response = await call_next(request)
    except Exception as exc:
        duracao_ms = round((time.perf_counter() - inicio) * 1000.0, 1)
        return JSONResponse(
            status_code=500,
            content={"detail": f"Erro interno do servidor: {exc}"},
            headers={"X-Process-Time": f"{duracao_ms}ms", "X-Request-ID": req_id},
        )

    duracao_ms = round((time.perf_counter() - inicio) * 1000.0, 1)
    response.headers["X-Process-Time"] = f"{duracao_ms}ms"
    response.headers["X-Request-ID"] = req_id
    return response


# 3. Probes de Saúde e Orquestração
@app.get("/healthz", tags=["Governança"], summary="Liveness Probe")
async def healthz():
    return {"status": "ok", "versao": settings.VERSION}


@app.get("/readyz", tags=["Governança"], summary="Readiness Probe")
async def readyz():
    return {
        "status": "ready",
        "pool_http_ativo": hasattr(app.state, "http_client"),
        "porta": settings.PORT,
    }


# 4. Rota raiz
@app.get("/", tags=["Início"], summary="Apresentação da API")
async def raiz():
    return {
        "projeto": settings.PROJECT_NAME,
        "versao": settings.VERSION,
        "swagger_docs": "/docs",
        "redoc_docs": "/redoc",
        "metricas_prometheus": "/metrics",
        "health_check": "/healthz",
        "porta": settings.PORT,
    }


# 5. Roteadores Modulares
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(roteiros.router, prefix=settings.API_V1_PREFIX)
app.include_router(telemetria.router)
