"""Contratos Pydantic v2 estritos para roteiros turísticos, rotas e custos."""

from typing import Literal, Any
from pydantic import BaseModel, Field, field_validator
from app.core.catalogo import ESTADOS_BRASIL, ESTADOS_NOMES

def _normalizar_uf(uf_valor: str) -> str:
    uf_clean = uf_valor.strip().lower()
    if uf_clean in ESTADOS_NOMES:
        return ESTADOS_NOMES[uf_clean]
    uf_upper = uf_valor.strip().upper()
    if uf_upper in ESTADOS_BRASIL:
        return uf_upper
    raise ValueError(f"Sigla ou estado '{uf_valor}' é inválido no Brasil.")

def _sanitizar_texto(texto: str) -> str:
    texto_clean = texto.strip()
    if not texto_clean:
        raise ValueError("O campo de texto não pode ser vazio.")
    return texto_clean

class RoteiroRequest(BaseModel):
    """Payload de entrada para o planejamento concorrente de viagem."""
    origem_cidade: str = Field(..., min_length=2, max_length=100, description="Município de partida")
    origem_uf: str = Field(..., min_length=2, max_length=30, description="Sigla da UF de partida (ex: PI)")
    destino_cidade: str = Field(..., min_length=2, max_length=100, description="Município de destino")
    destino_uf: str = Field(..., min_length=2, max_length=30, description="Sigla da UF de destino (ex: PI)")
    tipo_propulsao: Literal["combustao", "ev"] = Field(default="combustao", description="Tipo do motor")
    consumo_medio: float = Field(default=12.0, gt=0, le=50, description="Km/l ou Km/kWh")
    capacidade_tanque_bateria: float = Field(default=50.0, gt=0, le=200, description="Litros ou kWh")
    preco_unidade_energia: float = Field(default=5.89, gt=0, description="Preço por litro ou kWh")
    dias_estadia: int = Field(default=3, ge=1, le=5, description="Dias planejados (1 a 5)")
    estilo_viagem: Literal["Cultural", "Gastronômico", "Ecoturismo", "Família", "Romântico"] = Field(
        default="Cultural", description="Perfil do viajante"
    )
    preferencia_rota: Literal["tempo", "economia"] = Field(default="tempo", description="Critério de rota")

    @field_validator("origem_uf", "destino_uf", mode="before")
    @classmethod
    def validar_uf(cls, v: Any) -> str:
        if not isinstance(v, str):
            raise ValueError("UF deve ser uma string.")
        return _normalizar_uf(v)

    @field_validator("origem_cidade", "destino_cidade", mode="before")
    @classmethod
    def validar_cidade(cls, v: Any) -> str:
        if not isinstance(v, str):
            raise ValueError("Cidade deve ser uma string.")
        return _sanitizar_texto(v)


class MapaRotaRequest(BaseModel):
    origem_lat: float = Field(..., ge=-90, le=90)
    origem_lon: float = Field(..., ge=-180, le=180)
    destino_lat: float = Field(..., ge=-90, le=90)
    destino_lon: float = Field(..., ge=-180, le=180)
    tipo_propulsao: Literal["combustao", "ev"] = "combustao"
    autonomia_nominal_km: float = Field(default=500.0, gt=0)


class GuiaStreamRequest(BaseModel):
    destino: str = Field(..., min_length=2)
    dias_estadia: int = Field(default=3, ge=1, le=5)
    estilo_viagem: str = Field(default="Cultural")
    clima_info: dict[str, Any] = Field(default_factory=dict)
    atrativos: list[str] = Field(default_factory=list)
    gastronomia: list[str] = Field(default_factory=list)


class CustosRequest(BaseModel):
    distancia_km: float = Field(..., gt=0)
    tipo_propulsao: Literal["combustao", "ev"]
    consumo_medio: float = Field(..., gt=0)
    preco_unidade: float = Field(..., gt=0)
    uf_origem: str = Field(..., min_length=2)
    uf_destino: str = Field(..., min_length=2)
    num_passageiros: int = Field(default=1, ge=1, le=8)

    @field_validator("uf_origem", "uf_destino", mode="before")
    @classmethod
    def validar_uf_custos(cls, v: Any) -> str:
        return _normalizar_uf(str(v))


class ParadaRecarga(BaseModel):
    km_parada: float
    nome: str
    tipo: str
    lat: float
    lon: float
    tempo_estimado_min: int


class AltimetriaInfo(BaseModel):
    ganho_elevacao_m: float
    perda_elevacao_m: float
    altitude_maxima_m: float
    altitude_minima_m: float
    desnivel_liquido_m: float
    penalizacao_consumo_pct: float
    perfil: list[dict[str, float]] = Field(default_factory=list)


class VisitaPatchRequest(BaseModel):
    atrativo: str = Field(..., min_length=1)
    visitado: bool


class CompartilharRequest(BaseModel):
    canal: Literal["whatsapp", "email", "maps"] = "whatsapp"
    destinatario: str | None = None
