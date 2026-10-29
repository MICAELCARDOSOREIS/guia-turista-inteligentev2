"""Serviço assíncrono de geocodificação e meteorologia via Open-Meteo."""

from typing import Any
import httpx
from app.core.config import get_settings
from app.core.catalogo import DESTINOS_CATALOGO, ESTADOS_NOMES

settings = get_settings()

COORDENADAS_FALLBACK = {
    "teresina": (-5.0892, -42.8016, "Teresina - PI"),
    "parnaiba": (-2.9038, -41.7766, "Parnaíba - PI"),
    "luis correia": (-2.8794, -41.6669, "Luís Correia - PI"),
    "pedro ii": (-4.4258, -41.4586, "Pedro II - PI"),
    "piripiri": (-4.2733, -41.7769, "Piripiri - PI"),
    "fortaleza": (-3.7172, -38.5433, "Fortaleza - CE"),
    "jericoacoara": (-2.7958, -40.5142, "Jericoacoara - CE"),
    "sao paulo": (-23.5505, -46.6333, "São Paulo - SP"),
    "rio de janeiro": (-22.9068, -43.1729, "Rio de Janeiro - RJ"),
    "brasilia": (-15.7975, -47.8919, "Brasília - DF"),
}

async def buscar_coordenadas_async(
    client: httpx.AsyncClient, cidade: str, uf: str = ""
) -> tuple[float, float, str]:
    """Consulta geocodificação na Open-Meteo com filtro Brasil e fallback resiliente."""
    chave = cidade.strip().lower()
    if chave in COORDENADAS_FALLBACK:
        lat, lon, nome = COORDENADAS_FALLBACK[chave]
        return lat, lon, nome

    url = f"{settings.OPEN_METEO_GEO_URL}/search"
    params = {"name": cidade, "count": 1, "language": "pt", "country_codes": "BR"}

    try:
        resp = await client.get(url, params=params, timeout=4.0)
        if resp.status_code == 200:
            dados = resp.json()
            if dados.get("results"):
                res = dados["results"][0]
                lat = float(res["latitude"])
                lon = float(res["longitude"])
                admin1 = res.get("admin1", uf)
                sigla = ESTADOS_NOMES.get(admin1.lower(), uf.upper() or "BR")
                nome_formatado = f"{res.get('name', cidade)} - {sigla}"
                return lat, lon, nome_formatado
    except Exception:
        pass

    # Fallback determinístico
    return -5.0892, -42.8016, f"{cidade.title()} - {uf.upper()}"


async def obter_clima_async(
    client: httpx.AsyncClient, lat: float, lon: float
) -> dict[str, Any]:
    """Obtém previsão meteorológica atual na Open-Meteo."""
    url = f"{settings.OPEN_METEO_BASE_URL}/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": ["temperature_2m", "relative_humidity_2m", "apparent_temperature", "weather_code", "wind_speed_10m"],
        "timezone": "America/Fortaleza",
    }

    try:
        resp = await client.get(url, params=params, timeout=4.0)
        if resp.status_code == 200:
            dados = resp.json().get("current", {})
            temp = dados.get("temperature_2m", 28.0)
            sensacao = dados.get("apparent_temperature", 30.0)
            umidade = dados.get("relative_humidity_2m", 65)
            vento = dados.get("wind_speed_10m", 15.0)
            return {
                "temperatura": temp,
                "sensacao_termica": sensacao,
                "umidade": umidade,
                "velocidade_vento": vento,
                "condicao": "Ensolarado e ventoso" if vento > 12 else "Céu claro",
            }
    except Exception:
        pass

    return {
        "temperatura": 29.0,
        "sensacao_termica": 31.5,
        "umidade": 60,
        "velocidade_vento": 14.0,
        "condicao": "Ensolarado com ventos litorâneos",
    }
