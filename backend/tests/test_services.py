import pytest
from app.services.postos_service import calcular_paradas_autonomia
from app.services.custos_service import calcular_custos_viagem
from app.services.altimetria_service import calcular_penalizacao_altimetrica
from app.core.circuit_breaker import CircuitBreaker, CircuitBreakerOpenException

def test_calculo_paradas_autonomia():
    # Rota de 700 km, autonomia nominal de 500 km (reserva de 18% -> limite ~410 km)
    paradas = calcular_paradas_autonomia(distancia_km=700.0, tipo_propulsao="combustao", autonomia_nominal_km=500.0)
    assert len(paradas) >= 1
    assert paradas[0]["km_parada"] <= 410.0
    assert "Posto" in paradas[0]["nome"]

def test_calculo_paradas_ev():
    paradas = calcular_paradas_autonomia(distancia_km=600.0, tipo_propulsao="ev", autonomia_nominal_km=350.0)
    assert len(paradas) >= 1
    assert "Eletroposto" in paradas[0]["nome"]

def test_calculo_custos_rateio():
    resultado = calcular_custos_viagem(
        distancia_km=340.0,
        tipo_propulsao="combustao",
        consumo_medio=10.0,
        preco_unidade=6.0,
        uf_origem="PI",
        uf_destino="PI",
        num_passageiros=4
    )
    assert resultado["custo_combustivel_ou_energia"] == 204.0
    assert resultado["custo_por_passageiro"] == 51.0
    assert resultado["num_passageiros"] == 4

def test_calculo_penalizacao_altimetrica():
    penalidade = calcular_penalizacao_altimetrica(ganho_elevacao_m=1500.0, distancia_km=300.0)
    assert penalidade > 0.0
    assert penalidade <= 25.0

@pytest.mark.asyncio
async def test_circuit_breaker_abre_apos_falhas():
    cb = CircuitBreaker(falhas_maximas=2, tempo_recuperacao_segundos=1.0)
    
    async def servico_falho():
        raise RuntimeError("API Externa Indisponível")
        
    with pytest.raises(RuntimeError):
        await cb.executar(servico_falho)
    with pytest.raises(RuntimeError):
        await cb.executar(servico_falho)
        
    # Na terceira chamada, o circuito deve estar OPEN
    with pytest.raises(CircuitBreakerOpenException):
        await cb.executar(servico_falho)
