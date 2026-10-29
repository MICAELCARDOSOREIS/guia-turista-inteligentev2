"""Injeção de dependências do FastAPI (pool HTTP compartilhado, identificador de usuário)."""

from typing import Annotated
import httpx
from fastapi import Header, Request

async def obter_http_client(request: Request) -> httpx.AsyncClient:
    """Injeta a instância do AsyncClient compartilhado no contexto do lifespan."""
    client: httpx.AsyncClient = getattr(request.app.state, "http_client", None)
    if client is None:
        client = httpx.AsyncClient(timeout=6.0)
    return client

async def obter_usuario_ativo(
    x_user_id: Annotated[str | None, Header(description="Identificador da sessão do usuário")] = None,
) -> str:
    """Extrai o identificador único do usuário (Google ID ou guest_XXXX) ou atribui anônimo."""
    if x_user_id and x_user_id.strip():
        return x_user_id.strip()
    return "guest_anonimo"
