from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

Prioridade = Literal["baixa", "media", "alta"]
StatusTarefa = Literal["pendente", "em_andamento", "concluida"]
TipoEvento = Literal["tarefa", "entrega", "evento", "estudo"]


class CamelModel(BaseModel):
    """JSON em camelCase (como o frontend), atributos em snake_case (como o banco)."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class EtapaIn(CamelModel):
    id: int | None = None
    titulo: str = Field(min_length=1, max_length=200)
    concluida: bool = False


class EtapaOut(CamelModel):
    id: int
    titulo: str
    concluida: bool
