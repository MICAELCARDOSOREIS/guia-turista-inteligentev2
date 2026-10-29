"""Serviço de persistência atômica thread-safe e isolamento de viagens por usuário em JSON."""

import json
import threading
from pathlib import Path
from typing import Any
from app.core.config import get_settings

settings = get_settings()
_storage_lock = threading.Lock()

def _garantir_arquivo_existe() -> Path:
    caminho = settings.VIAGENS_FILE
    caminho.parent.mkdir(parents=True, exist_ok=True)
    if not caminho.exists():
        with open(caminho, "w", encoding="utf-8") as f:
            json.dump({}, f, indent=2, ensure_ascii=False)
    return caminho

def _ler_dados_seguro() -> dict[str, list[dict[str, Any]]]:
    caminho = _garantir_arquivo_existe()
    with _storage_lock:
        try:
            with open(caminho, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

def _salvar_dados_seguro(dados: dict[str, list[dict[str, Any]]]) -> bool:
    caminho = _garantir_arquivo_existe()
    with _storage_lock:
        try:
            # Escrita atômica usando arquivo temporário
            caminho_tmp = caminho.with_suffix(".tmp")
            with open(caminho_tmp, "w", encoding="utf-8") as f:
                json.dump(dados, f, indent=2, ensure_ascii=False)
            caminho_tmp.replace(caminho)
            return True
        except Exception:
            return False

def salvar_nova_viagem(user_id: str, roteiro: dict[str, Any]) -> bool:
    """Insere um novo roteiro na lista do usuário preservando isolamento."""
    dados = _ler_dados_seguro()
    if user_id not in dados:
        dados[user_id] = []

    # Se já existir um roteiro com mesmo ID, atualizamos
    roteiro_id = roteiro.get("id")
    for idx, r in enumerate(dados[user_id]):
        if r.get("id") == roteiro_id:
            dados[user_id][idx] = roteiro
            return _salvar_dados_seguro(dados)

    dados[user_id].insert(0, roteiro)
    return _salvar_dados_seguro(dados)

def listar_viagens_usuario(user_id: str) -> list[dict[str, Any]]:
    """Recupera todas as viagens salvas do usuário."""
    dados = _ler_dados_seguro()
    return dados.get(user_id, [])

def remover_viagem(user_id: str, roteiro_id: str) -> bool:
    """Exclui uma viagem específica do usuário."""
    dados = _ler_dados_seguro()
    if user_id in dados:
        viagens_anteriores = len(dados[user_id])
        dados[user_id] = [r for r in dados[user_id] if r.get("id") != roteiro_id]
        if len(dados[user_id]) < viagens_anteriores:
            return _salvar_dados_seguro(dados)
    return False

def atualizar_visita_atrativo(
    user_id: str, roteiro_id: str, atrativo: str, visitado: bool
) -> bool:
    """Marca ou desmarca um ponto turístico visitado em um roteiro salvo."""
    dados = _ler_dados_seguro()
    if user_id in dados:
        for r in dados[user_id]:
            if r.get("id") == roteiro_id:
                visitados = set(r.get("atrativos_visitados", []))
                if visitado:
                    visitados.add(atrativo)
                else:
                    visitados.discard(atrativo)
                r["atrativos_visitados"] = list(visitados)
                return _salvar_dados_seguro(dados)
    return False
