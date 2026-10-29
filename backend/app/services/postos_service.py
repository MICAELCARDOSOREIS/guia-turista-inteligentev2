"""Serviço de cálculo de autonomia e alocação de postos de recarga e combustível."""

import math
from typing import Any
from app.core.catalogo import REDES_POSTOS_COMBUSTAO, REDES_POSTOS_EV

def calcular_paradas_autonomia(
    distancia_km: float,
    tipo_propulsao: str = "combustao",
    autonomia_nominal_km: float = 500.0,
    coordinates: list[list[float]] | None = None,
) -> list[dict[str, Any]]:
    """Projeta paradas necessárias antes que a autonomia atinja o limiar crítico de reserva (margem de ~18%)."""
    # Limiar útil seguro: 82% da autonomia nominal
    limite_seguro_km = max(autonomia_nominal_km * 0.82, 100.0)

    paradas: list[dict[str, Any]] = []
    redes = REDES_POSTOS_EV if tipo_propulsao == "ev" else REDES_POSTOS_COMBUSTAO
    tipo_label = "Eletroposto de Carga Rápida" if tipo_propulsao == "ev" else "Posto de Combustível Rodoviário"
    tempo_medio = 35 if tipo_propulsao == "ev" else 15

    km_acumulado = limite_seguro_km
    indice = 0

    while km_acumulado < distancia_km:
        nome_rede = redes[indice % len(redes)]
        frac = km_acumulado / max(distancia_km, 1.0)

        # Se houver coordenadas, interpolamos a latitude e longitude exata da parada na rota
        if coordinates and len(coordinates) > 1:
            idx_coord = min(int(frac * (len(coordinates) - 1)), len(coordinates) - 1)
            lon_p, lat_p = coordinates[idx_coord]
        else:
            lat_p = -4.5 + frac * 2.0
            lon_p = -42.0 + frac * 1.5

        paradas.append({
            "km_parada": round(km_acumulado, 1),
            "nome": f"{nome_rede} (km {int(km_acumulado)})",
            "tipo": tipo_label,
            "lat": round(lat_p, 5),
            "lon": round(lon_p, 5),
            "tempo_estimado_min": tempo_medio,
            "reserva_restante_pct": 18,
        })

        km_acumulado += limite_seguro_km
        indice += 1

    return paradas
