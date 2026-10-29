"""Contratos Pydantic v2 para autenticação Google e Sessão Híbrida."""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class TokenGoogleRequest(BaseModel):
    credential: str = Field(..., min_length=10, description="Token JWT retornado pelo Google Identity Services")

class UsuarioPerfil(BaseModel):
    user_id: str
    nome: str
    email: Optional[str] = None
    foto_url: Optional[str] = None
    is_visitante: bool = False
    expira_em_segundos: Optional[int] = None

class LoginResponse(BaseModel):
    token: str
    usuario: UsuarioPerfil
    mensagem: str = "Autenticação realizada com sucesso"
