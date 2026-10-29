"""Serviço de geração e streaming de guia turístico com IA (Google Gemini)."""

import asyncio
from typing import AsyncGenerator, Any
import httpx
from app.core.config import get_settings

settings = get_settings()

SYSTEM_PROMPT = """Você é o Guia do Turista Inteligente, assistente de bordo ultra-objetivo e minimalista.
Diretrizes inegociáveis de concisão:
1. Identidade Local: Exatamente 1 frase direta (máximo 20 palavras) resumindo a essência cultural do destino.
2. Roteiro Prático: Dividido estritamente em Manhã, Tarde e Noite para cada dia (máximo 15 palavras por turno).
3. Gastronomia: Exatamente 1 frase citando 2 a 3 sabores emblemáticos e onde saboreá-los.
4. Orientações e Clima: Exatamente 1 frase conectando a temperatura informada ao vestuário e hidratação.
Sem enrolação, sem clichês e sem introduções prolixas."""

def _montar_guia_deterministico(
    destino: str,
    dias_estadia: int,
    estilo_viagem: str,
    clima_info: dict[str, Any],
    atrativos: list[str],
    gastronomia: list[str],
) -> list[str]:
    """Fallback determinístico calibrado caso a chave do Gemini não esteja ativa."""
    temp = clima_info.get("temperatura", 29.0)
    cond = clima_info.get("condicao", "Ensolarado")
    
    atr1 = atrativos[0] if atrativos else f"o centro histórico de {destino}"
    atr2 = atrativos[1] if len(atrativos) > 1 else f"os mirantes e orla de {destino}"
    pratos = ", ".join(gastronomia[:3]) if gastronomia else "pratos regionais e doces típicos"

    paragrafos = [
        f"🏛️ **Identidade & Atmosfera:** {destino} combina tradição cultural marcante, natureza exuberante e acolhimento singular para o viajante {estilo_viagem.lower()}.\n\n",
        f"🗓️ **Roteiro Sugerido ({dias_estadia} dia{'s' if dias_estadia > 1 else ''}):**\n",
        f"• **Manhã:** Inicie explorando com calma {atr1} aproveitando a temperatura mais fresca da alvorada.\n",
        f"• **Tarde:** Visite {atr2} com parada estratégica para sombra e fotos panorâmicas do percurso.\n",
        f"• **Noite:** Desfrute da culinária boêmia e passeios iluminados nos pólos culturais da cidade.\n\n",
        f"🍲 **Tradições Gastronômicas:** Saboreie {pratos} nos restaurantes tradicionais da região.\n\n",
        f"☀️ **Orientações & Clima ({temp}°C, {cond}):** Vista roupas leves com proteção solar e hidrate-se com frequência durante os deslocamentos rodoviários.\n"
    ]
    return paragrafos


async def gerar_guia_ia_stream_async(
    destino: str,
    dias_estadia: int = 3,
    estilo_viagem: str = "Cultural",
    clima_info: dict[str, Any] | None = None,
    atrativos: list[str] | None = None,
    gastronomia: list[str] | None = None,
) -> AsyncGenerator[str, None]:
    """Gera o guia em blocos progressivos assíncronos para consumo via Server-Sent Events (SSE)."""
    clima = clima_info or {"temperatura": 28.0, "condicao": "Céu claro"}
    atr = atrativos or []
    gas = gastronomia or []

    # Se houver chave Gemini, tentamos a API com streaming
    if settings.GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:streamGenerateContent?key={settings.GEMINI_API_KEY}"
            prompt_usuario = (
                f"Destino: {destino}\nDias: {dias_estadia}\nPerfil: {estilo_viagem}\n"
                f"Clima Atual: {clima.get('temperatura')}°C, {clima.get('condicao')}\n"
                f"Atrativos Sugeridos: {', '.join(atr)}\nGastronomia: {', '.join(gas)}"
            )
            payload = {
                "contents": [{"parts": [{"text": f"{SYSTEM_PROMPT}\n\n{prompt_usuario}"}]}],
                "generationConfig": {"temperature": 0.4, "maxOutputTokens": 450}
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                async with client.stream("POST", url, json=payload) as response:
                    if response.status_code == 200:
                        async for linha in response.aiter_lines():
                            if linha:
                                yield linha
                        return
        except Exception:
            pass

    # Fallback ultra-rápido transmitindo em chunks progressivos via SSE
    paragrafos = _montar_guia_deterministico(
        destino, dias_estadia, estilo_viagem, clima, atr, gas
    )
    for bloco in paragrafos:
        # Simulamos fluxo em tempo real de digitação progressiva
        yield bloco
        await asyncio.sleep(0.02)


async def gerar_guia_ia_async(
    destino: str,
    dias_estadia: int = 3,
    estilo_viagem: str = "Cultural",
    clima_info: dict[str, Any] | None = None,
    atrativos: list[str] | None = None,
    gastronomia: list[str] | None = None,
) -> tuple[str, dict[str, Any]]:
    """Geração direta não-streaming para compor a resposta consolidada de /planejar."""
    chunks = []
    async for chunk in gerar_guia_ia_stream_async(
        destino, dias_estadia, estilo_viagem, clima_info, atrativos, gastronomia
    ):
        chunks.append(chunk)

    texto = "".join(chunks)
    diag = {
        "modelo": settings.GEMINI_MODEL if settings.GEMINI_API_KEY else "FastAPI Engine Offline",
        "tokens_estimados": len(texto.split()),
        "status": "online" if settings.GEMINI_API_KEY else "modo_resiliente_ativo",
    }
    return texto, diag
