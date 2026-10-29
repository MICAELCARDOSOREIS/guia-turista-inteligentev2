from app.core.config import get_settings

def test_settings_default_values():
    settings = get_settings()
    assert settings.PORT == 8001
    assert "http://localhost:5173" in settings.CORS_ORIGINS
    assert settings.API_V1_PREFIX == "/api/v1"
