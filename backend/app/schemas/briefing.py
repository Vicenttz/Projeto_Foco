from datetime import date
from typing import Literal

from app.schemas.base import CamelModel, TipoEvento


class Destaque(CamelModel):
    """Um compromisso citado na mensagem do dia."""

    id: int
    tipo: TipoEvento
    titulo: str
    data: date
    hora: str | None = None
    quando: str  # "hoje", "amanhã", "em 3 dias"
    disciplina: str | None = None


class Sugestao(CamelModel):
    """Sugestão do assistente. É só uma sugestão: nada é criado ou alterado sem o usuário confirmar."""

    texto: str
    rota: str | None = None  # tela do app para abrir (ex.: /calendario)
    query: dict[str, str] | None = None  # parâmetros que pré-preenchem a tela (ex.: novo=estudo)


class BriefingOut(CamelModel):
    data: date
    saudacao: str
    texto: str
    hoje: list[Destaque]
    proximos: list[Destaque]
    sugestoes: list[Sugestao]
    gerado_por: Literal["regras", "gemini"]
