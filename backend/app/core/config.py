"""Configurações Pydantic-Settings do Guia do Turista Inteligente v2."""

from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent
STATIC_DATA_DIR = BASE_DIR / "static" / "data"

class Settings(BaseSettings):
    """Configurações centralizadas com tipagem estrita."""
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    PROJECT_NAME: str = "Guia do Turista Inteligente v2"
    VERSION: str = "2.0.0"
    API_V1_PREFIX: str = "/api/v1"
    PORT: int = 8001
    HOST: str = "0.0.0.0"

    # Segurança e Sessão
    SECRET_KEY: str = "guia-turista-secret-key-2026-production"
    GOOGLE_CLIENT_ID: str = "776335673676-dk7od4ljhh43bio4bppf94i8ou0u9v9i.apps.googleusercontent.com"
    VISITANTE_TTL_HOURS: int = 2

    # IA e Provedores Externos
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"
    OPEN_METEO_GEO_URL: str = "https://geocoding-api.open-meteo.com/v1"
    OSRM_BASE_URL: str = "https://router.project-osrm.org"
    OPEN_ELEVATION_BASE_URL: str = "https://api.open-elevation.com/api/v1"

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Armazenamento
    DATA_DIR: Path = STATIC_DATA_DIR
    VIAGENS_FILE: Path = STATIC_DATA_DIR / "viagens.json"


@lru_cache
def get_settings() -> Settings:
    return Settings()
