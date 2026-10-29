import pytest
from pydantic import ValidationError
from app.schemas.roteiros import RoteiroRequest, CustosRequest, GuiaStreamRequest
from app.schemas.auth import TokenGoogleRequest, UsuarioPerfil

def test_roteiro_request_valid():
    req = RoteiroRequest(
        origem_cidade="Teresina",
        origem_uf="pi",
        destino_cidade="Parnaíba",
        destino_uf="PI",
        tipo_propulsao="combustao",
        consumo_medio=12.5,
        capacidade_tanque_bateria=50.0,
        preco_unidade_energia=5.89,
        dias_estadia=3,
        estilo_viagem="Cultural",
    )
    assert req.origem_uf == "PI"
    assert req.destino_uf == "PI"
    assert req.origem_cidade == "Teresina"
    assert req.dias_estadia == 3

def test_roteiro_request_invalid_uf():
    with pytest.raises(ValidationError):
        RoteiroRequest(
            origem_cidade="Teresina",
            origem_uf="XX",
            destino_cidade="Parnaíba",
            destino_uf="PI",
            tipo_propulsao="combustao",
            consumo_medio=10.0,
            capacidade_tanque_bateria=40.0,
            preco_unidade_energia=5.0,
        )

def test_custos_request_validation():
    req = CustosRequest(
        distancia_km=340.5,
        tipo_propulsao="ev",
        consumo_medio=6.5,
        preco_unidade=0.85,
        uf_origem="PI",
        uf_destino="CE",
        num_passageiros=4
    )
    assert req.num_passageiros == 4

def test_custos_request_invalid_passageiros():
    with pytest.raises(ValidationError):
        CustosRequest(
            distancia_km=100.0,
            tipo_propulsao="combustao",
            consumo_medio=10.0,
            preco_unidade=5.0,
            uf_origem="PI",
            uf_destino="PI",
            num_passageiros=0  # mínimo 1
        )

def test_usuario_perfil():
    perfil = UsuarioPerfil(
        user_id="user_123",
        nome="Micael Teste",
        email="micael@example.com",
        is_visitante=False,
    )
    assert perfil.user_id == "user_123"
    assert perfil.is_visitante is False
