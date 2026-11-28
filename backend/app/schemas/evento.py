from datetime import date, time

from pydantic import Field, field_serializer, field_validator

from app.schemas.base import CamelModel, TipoEvento


class _CamposAgenda(CamelModel):
    """Validações comuns: hora vazia vira null e a duração fica entre 5 min e 24 h."""

    @field_validator("hora", mode="before", check_fields=False)
    @classmethod
    def _hora_vazia(cls, v):
        return None if v == "" else v


class EventoCreate(_CamposAgenda):
    titulo: str = Field(min_length=1, max_length=200)
    data: date
    tipo: TipoEvento = "evento"
    hora: time | None = None  # "HH:MM"; sem hora = dia inteiro
    duracao_min: int | None = Field(default=None, ge=5, le=1440)
    disciplina_id: int | None = None
    descricao: str | None = Field(default=None, max_length=2000)
    concluido: bool = False


class EventoUpdate(_CamposAgenda):
    titulo: str | None = Field(default=None, min_length=1, max_length=200)
    data: date | None = None
    tipo: TipoEvento | None = None
    hora: time | None = None
    duracao_min: int | None = Field(default=None, ge=5, le=1440)
    disciplina_id: int | None = None
    descricao: str | None = Field(default=None, max_length=2000)
    concluido: bool | None = None


class EventoOut(CamelModel):
    id: int
    titulo: str
    data: date
    tipo: TipoEvento
    hora: time | None = None
    duracao_min: int | None = None
    disciplina_id: int | None = None
    descricao: str | None = None
    concluido: bool = False

    @field_serializer("hora")
    def _hora_hhmm(self, v: time | None) -> str | None:
        return v.strftime("%H:%M") if v else None
