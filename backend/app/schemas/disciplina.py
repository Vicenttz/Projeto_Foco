from pydantic import Field

from app.schemas.base import CamelModel


class DisciplinaCreate(CamelModel):
    nome: str = Field(min_length=1, max_length=100)
    professor: str | None = Field(default=None, max_length=100)
    cor: str | None = Field(default=None, max_length=20)


class DisciplinaUpdate(CamelModel):
    nome: str | None = Field(default=None, min_length=1, max_length=100)
    professor: str | None = Field(default=None, max_length=100)
    cor: str | None = Field(default=None, max_length=20)


class DisciplinaOut(CamelModel):
    id: int
    nome: str
    professor: str | None = None
    cor: str | None = None
    progresso: int
