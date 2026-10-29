import pytest
from app.services.gpx_service import gerar_xml_gpx
from app.services.gemini_service import gerar_guia_ia_stream_async
from app.services.storage_service import (
    salvar_nova_viagem,
    listar_viagens_usuario,
    remover_viagem,
    atualizar_visita_atrativo,
)

@pytest.mark.asyncio
async def test_gerar_guia_stream():
    chunks = []
    async for chunk in gerar_guia_ia_stream_async(
        destino="Parnaíba - PI",
        dias_estadia=2,
        estilo_viagem="Ecoturismo",
        clima_info={"temperatura": 28.5, "condicao": "Ensolarado e ventoso"},
        atrativos=["Delta do Parnaíba", "Porto das Barcas"],
        gastronomia=["Torta de Caranguejo", "Peixada"],
    ):
        chunks.append(chunk)

    texto_completo = "".join(chunks)
    assert len(chunks) > 0
    assert "Parnaíba" in texto_completo
    assert ("Manhã" in texto_completo or "Dia" in texto_completo)

def test_gerar_xml_gpx():
    coords = [(-42.8016, -5.0892), (-41.7766, -2.9038)]
    gpx = gerar_xml_gpx("Teresina - PI", "Parnaíba - PI", coords)
    assert '<?xml version="1.0" encoding="UTF-8"?>' in gpx
    assert '<gpx version="1.1"' in gpx
    assert '<trkpt lat="-5.0892" lon="-42.8016">' in gpx
    assert '</gpx>' in gpx

def test_storage_service_crud(tmp_path, monkeypatch):
    import app.services.storage_service as storage_mod
    monkeypatch.setattr(storage_mod.settings, "VIAGENS_FILE", tmp_path / "viagens.json")
    user_id = "test_user_storage"
    roteiro_mock = {
        "id": "roteiro_test_1",
        "origem": "Teresina",
        "destino": "Parnaíba",
        "distancia_km": 340.0,
        "atrativos_visitados": []
    }

    # Salva
    salvo = salvar_nova_viagem(user_id, roteiro_mock)
    assert salvo is True

    # Lista
    viagens = listar_viagens_usuario(user_id)
    assert len(viagens) >= 1
    assert any(v["id"] == "roteiro_test_1" for v in viagens)

    # Atualiza visita
    atualizado = atualizar_visita_atrativo(user_id, "roteiro_test_1", "Delta do Parnaíba", True)
    assert atualizado is True

    # Remove
    removido = remover_viagem(user_id, "roteiro_test_1")
    assert removido is True
    assert not any(v["id"] == "roteiro_test_1" for v in listar_viagens_usuario(user_id))
