"""Serviço de cálculo de despesas de combustível/energia, pedágios e rateio entre passageiros."""

from typing import Any
from app.core.catalogo import TARIFAS_PEDAGIO_UF

def calcular_custos_viagem(
    distancia_km: float,
    tipo_propulsao: str,
    consumo_medio: float,
    preco_unidade: float,
    uf_origem: str,
    uf_destino: str,
    num_passageiros: int = 1,
    penalizacao_altimetrica_pct: float = 0.0,
) -> dict[str, Any]:
    """Calcula despesas de energia/combustível com correção altimétrica, pedágios por estado e rateio individual."""
    consumo_ajustado = consumo_medio * (1.0 - (penalizacao_altimetrica_pct / 100.0) * 0.5)
    consumo_ajustado = max(consumo_ajustado, 2.0)

    unidades_necessarias = distancia_km / consumo_ajustado
    custo_combustivel = round(unidades_necessarias * preco_unidade, 2)

    # Cálculo de pedágios regionais pela UF de origem e destino
    tarifa_origem = TARIFAS_PEDAGIO_UF.get(uf_origem.upper(), 0.0)
    tarifa_destino = TARIFAS_PEDAGIO_UF.get(uf_destino.upper(), 0.0)
    tarifa_media_km = (tarifa_origem + tarifa_destino) / 2.0
    custo_pedagios = round(distancia_km * tarifa_media_km, 2)

    custo_total = round(custo_combustivel + custo_pedagios, 2)
    passageiros = max(num_passageiros, 1)
    custo_por_passageiro = round(custo_total / passageiros, 2)

    # Estimativa ESG de CO2 (zero para EV na rodagem direta, ~120g CO2/km para gasolina)
    emissoes_co2_kg = 0.0 if tipo_propulsao == "ev" else round(distancia_km * 0.12, 1)

    return {
        "distancia_km": round(distancia_km, 1),
        "tipo_propulsao": tipo_propulsao,
        "consumo_nominal": consumo_medio,
        "unidades_consumidas": round(unidades_necessarias, 1),
        "unidade_medida": "kWh" if tipo_propulsao == "ev" else "litros",
        "preco_unidade": preco_unidade,
        "custo_combustivel_ou_energia": custo_combustivel,
        "custo_pedagios": custo_pedagios,
        "custo_total": custo_total,
        "num_passageiros": passageiros,
        "custo_por_passageiro": custo_por_passageiro,
        "emissoes_co2_kg": emissoes_co2_kg,
    }
