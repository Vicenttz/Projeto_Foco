from datetime import date

from pydantic import Field

from app.schemas.base import CamelModel, EtapaIn, EtapaOut, StatusTarefa


class ProjetoCreate(CamelModel):
    nome: str = Field(min_length=1, max_length=150)
    descricao: str | None = None
    data_entrega: date
    status: StatusTarefa = "pendente"
    etapas: list[EtapaIn] = []


class ProjetoUpdate(CamelModel):
    nome: str | None = Field(default=None, min_length=1, max_length=150)
    descricao: str | None = None
    data_entrega: date | None = None
    status: StatusTarefa | None = None
    etapas: list[EtapaIn] | None = None  # se enviado, substitui a lista de etapas


class ProjetoOut(CamelModel):
    id: int
    nome: str
    descricao: str | None = None
    data_entrega: date
    progresso: int
    status: StatusTarefa
    etapas: list[EtapaOut]
