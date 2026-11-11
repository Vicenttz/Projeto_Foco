from pydantic import Field

from app.schemas.base import CamelModel, EtapaIn, EtapaOut


class TrilhaCreate(CamelModel):
    assunto: str = Field(min_length=1, max_length=200)
    etapas: list[EtapaIn] = []


class TrilhaUpdate(CamelModel):
    assunto: str | None = Field(default=None, min_length=1, max_length=200)
    etapas: list[EtapaIn] | None = None


class TrilhaOut(CamelModel):
    id: int
    assunto: str
    progresso: int
    etapas: list[EtapaOut]
