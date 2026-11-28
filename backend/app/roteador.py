"""Rotas e contexto da requisição."""
import re
from dataclasses import dataclass, field

from .erros import Erro
from .validacao import data_iso

ROTAS: list[tuple[str, re.Pattern, object, str | None]] = []


def rota(metodo: str, caminho: str, auth: str | None = "user"):
    """Registra uma rota. auth: None (pública), "user" (login) ou "admin". {id} vira número inteiro."""
    padrao = re.compile("^/api" + re.sub(r"\{(\w+)\}", r"(?P<\1>\\d+)", caminho) + "$")

    def deco(fn):
        ROTAS.append((metodo, padrao, fn, auth))
        return fn

    return deco


@dataclass
class Contexto:
    con: object
    corpo: dict = field(default_factory=dict)
    query: dict = field(default_factory=dict)
    params: dict = field(default_factory=dict)
    usuario: object = None

    # ---- parâmetros de URL (?chave=valor) ----
    def q_int(self, nome: str, ge=None, le=None):
        v = self.query.get(nome)
        if v in (None, ""):
            return None
        try:
            n = int(v)
        except ValueError:
            raise Erro(422, f"{nome}: deve ser um número inteiro") from None
        if (ge is not None and n < ge) or (le is not None and n > le):
            raise Erro(422, f"{nome}: deve estar entre {ge} e {le}")
        return n

    def q_data(self, nome: str):
        v = self.query.get(nome)
        if v in (None, ""):
            return None
        try:
            return data_iso(v)
        except ValueError as e:
            raise Erro(422, f"{nome}: {e}") from None

    def q_enum(self, nome: str, valores: tuple):
        v = self.query.get(nome)
        if v in (None, ""):
            return None
        if v not in valores:
            raise Erro(422, f"{nome}: deve ser um de: " + ", ".join(valores))
        return v
