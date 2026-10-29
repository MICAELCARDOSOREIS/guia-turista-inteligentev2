"""Padrão Circuit Breaker para resiliência contra falhas em APIs externas."""

import time
import asyncio
from typing import Callable, Any, Awaitable

class CircuitBreakerOpenException(Exception):
    """Exceção levantada quando o circuito está aberto (serviço degradado)."""
    pass

class CircuitBreaker:
    """Implementa os estados CLOSED, OPEN e HALF_OPEN com fallback seguro."""
    def __init__(
        self,
        nome: str = "default",
        falhas_maximas: int = 3,
        tempo_recuperacao_segundos: float = 30.0,
    ):
        self.nome = nome
        self.falhas_maximas = falhas_maximas
        self.tempo_recuperacao_segundos = tempo_recuperacao_segundos
        self.falhas_consecutivas = 0
        self.estado = "CLOSED"  # "CLOSED", "OPEN", "HALF_OPEN"
        self.ultimo_momento_falha = 0.0
        self._lock = asyncio.Lock()

    async def executar(
        self,
        funcao_assincrona: Callable[..., Awaitable[Any]],
        *args: Any,
        fallback: Callable[..., Any] | None = None,
        **kwargs: Any,
    ) -> Any:
        agora = time.time()

        async with self._lock:
            if self.estado == "OPEN":
                if agora - self.ultimo_momento_falha > self.tempo_recuperacao_segundos:
                    self.estado = "HALF_OPEN"
                else:
                    if fallback is not None:
                        return fallback(*args, **kwargs) if not asyncio.iscoroutinefunction(fallback) else await fallback(*args, **kwargs)
                    raise CircuitBreakerOpenException(
                        f"Circuit breaker '{self.nome}' está ABERTO. Chamada interrompida imediatamente."
                    )

        try:
            resultado = await funcao_assincrona(*args, **kwargs)
            async with self._lock:
                if self.estado in ("HALF_OPEN", "CLOSED"):
                    self.falhas_consecutivas = 0
                    self.estado = "CLOSED"
            return resultado
        except Exception as exc:
            async with self._lock:
                self.falhas_consecutivas += 1
                self.ultimo_momento_falha = time.time()
                if self.falhas_consecutivas >= self.falhas_maximas:
                    self.estado = "OPEN"
            if fallback is not None:
                return fallback(*args, **kwargs) if not asyncio.iscoroutinefunction(fallback) else await fallback(*args, **kwargs)
            raise exc

    def get_status(self) -> dict[str, Any]:
        return {
            "nome": self.nome,
            "estado": self.estado,
            "falhas_consecutivas": self.falhas_consecutivas,
        }
