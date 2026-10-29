"""Roteador de autenticação Google e controle de sessão híbrida."""

import uuid
import time
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.config import get_settings
from app.core.dependencies import obter_http_client
from app.schemas.auth import TokenGoogleRequest, LoginResponse, UsuarioPerfil

router = APIRouter(prefix="/auth", tags=["Autenticação"])
settings = get_settings()

@router.post("/google", response_model=LoginResponse, summary="Autenticação com Google Sign-In")
async def login_google(
    payload: TokenGoogleRequest,
    client: httpx.AsyncClient = Depends(obter_http_client),
):
    """Valida o token JWT no endpoint oficial do Google OAuth2."""
    url = f"https://oauth2.googleapis.com/tokeninfo?id_token={payload.credential}"
    try:
        resp = await client.get(url, timeout=5.0)
        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token Google inválido ou expirado.",
            )
        dados = resp.json()
        sub = dados.get("sub")
        nome = dados.get("name", "Usuário Google")
        email = dados.get("email")
        picture = dados.get("picture")

        perfil = UsuarioPerfil(
            user_id=f"google_{sub}",
            nome=nome,
            email=email,
            foto_url=picture,
            is_visitante=False,
        )
        return LoginResponse(
            token=f"jwt_mock_{sub}",
            usuario=perfil,
            mensagem="Autenticação Google realizada com sucesso.",
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao validar token Google: {exc}",
        )

@router.post("/visitante", response_model=LoginResponse, summary="Gera sessão temporária de visitante")
async def login_visitante():
    """Emite um perfil volátil de visitante com TTL de 2 horas."""
    guest_uuid = uuid.uuid4().hex[:8]
    user_id = f"guest_{guest_uuid}"
    expira_em = settings.VISITANTE_TTL_HOURS * 3600

    perfil = UsuarioPerfil(
        user_id=user_id,
        nome="Viajante Visitante",
        email=None,
        foto_url=None,
        is_visitante=True,
        expira_em_segundos=expira_em,
    )
    return LoginResponse(
        token=f"guest_token_{guest_uuid}",
        usuario=perfil,
        mensagem=f"Sessão de visitante iniciada com validade de {settings.VISITANTE_TTL_HOURS} horas.",
    )

@router.post("/logout", summary="Encerramento seguro de sessão")
async def logout():
    return {"status": "ok", "mensagem": "Sessão encerrada com sucesso."}
