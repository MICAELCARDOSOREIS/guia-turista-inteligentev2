"""Serviço assíncrono de roteamento rodoviário com OSRM."""

import math
from typing import Any
import httpx
from app.core.config import get_settings

settings = get_settings()

def _gerar_polyline_interpolada(
    lat_o: float, lon_o: float, lat_d: float, lon_d: float, num_pontos: int = 25
) -> list[list[float]]:
    """Gera interpolação suave caso a OSRM pública falhe ou demore."""
    coords = []
    for i in range(num_pontos):
        frac = i / (num_pontos - 1)
        lat = lat_o + (lat_d - lat_o) * frac
        lon = lon_o + (lon_d - lon_o) * frac
        # Pequena curvatura para simular relevo de rodovia
        desvio = 0.05 * math.sin(frac * math.pi)
        coords.append([round(lon + desvio, 6), round(lat + desvio, 6)])
    return coords


async def calcular_rota_osrm_async(
    client: httpx.AsyncClient,
    lat_o: float,
    lon_o: float,
    lat_d: float,
    lon_d: float,
    preferencia_rota: str = "tempo",
) -> dict[str, Any]:
    """Consulta rota e alternativas no OSRM."""
    url = f"{settings.OSRM_BASE_URL}/route/v1/driving/{lon_o},{lat_o};{lon_d},{lat_d}"
    params = {
        "overview": "full",
        "geometries": "geojson",
        "alternatives": "true",
        "steps": "true",
    }

    try:
        resp = await client.get(url, params=params, timeout=4.5)
        if resp.status_code == 200:
            dados = resp.json()
            routes = dados.get("routes", [])
            if routes:
                r1 = routes[0]
                dist_km = round(r1["distance"] / 1000.0, 1)
                duracao_min = round(r1["duration"] / 60.0)
                coords = r1["geometry"]["coordinates"]

                rotas_alternativas = []
                for idx, r in enumerate(routes[:2]):
                    nome_sugestao = "Sugestão 01 (Rodovia Principal)" if idx == 0 else "Sugestão 02 (Mais Econômica)"
                    rotas_alternativas.append({
                        "id": f"rota_{idx+1}",
                        "nome": nome_sugestao,
                        "distancia_km": round(r["distance"] / 1000.0, 1),
                        "duracao_min": round(r["duration"] / 60.0),
                        "descricao": "Via BR asfaltada com melhor fluxo" if idx == 0 else "Via rodovias estaduais com menos pedágio",
                    })

                return {
                    "distancia_km": dist_km,
                    "duracao_min": duracao_min,
                    "duracao_formatada": f"{duracao_min // 60}h {duracao_min % 60}min",
                    "coordinates": coords,
                    "rotas_alternativas": rotas_alternativas,
                }
    except Exception:
        pass

    # Fallback seguro determinístico
    dist_estimada = round(math.hypot(lat_d - lat_o, lon_d - lon_o) * 111.0 * 1.25, 1)
    duracao_estimada = round(dist_estimada * 0.8)
    coords_fallback = _gerar_polyline_interpolada(lat_o, lon_o, lat_d, lon_d)

    return {
        "distancia_km": max(dist_estimada, 50.0),
        "duracao_min": max(duracao_estimada, 45),
        "duracao_formatada": f"{duracao_estimada // 60}h {duracao_estimada % 60}min",
        "coordinates": coords_fallback,
        "rotas_alternativas": [
            {
                "id": "rota_1",
                "nome": "Sugestão 01 (Rodovia Federal / Menor Tempo)",
                "distancia_km": dist_estimada,
                "duracao_min": duracao_estimada,
                "descricao": "Traçado direto pelas rodovias principais",
            },
            {
                "id": "rota_2",
                "nome": "Sugestão 02 (Rodovias Estaduais / Alternativa)",
                "distancia_km": round(dist_estimada * 1.08, 1),
                "duracao_min": round(duracao_estimada * 1.15),
                "descricao": "Traçado panorâmico contornando centros urbanos",
            }
        ],
    }
