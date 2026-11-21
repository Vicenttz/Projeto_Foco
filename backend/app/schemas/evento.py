from datetime import date

from pydantic import Field

from app.schemas.base import CamelModel, TipoEvento


class EventoCreate(CamelModel):
    titulo: str = Field(min_length=1, max_length=200)
    data: date
    tipo: TipoEvento = "evento"


class EventoUpdate(CamelModel):
    titulo: str | None = Field(default=None, min_length=1, max_length=200)
    data: date | None = None
    tipo: TipoEvento | None = None


class EventoOut(CamelModel):
    id: int
    titulo: str
    data: date
    tipo: TipoEvento
