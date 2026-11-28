"""Validação de entrada (substitui o Pydantic). Erros viram 422 no formato "campo: mensagem; campo: mensagem"."""
import re
from datetime import date, time

from .erros import Erro

PRIORIDADES = ("baixa", "media", "alta")
STATUS_TAREFA = ("pendente", "em_andamento", "concluida")
TIPOS_EVENTO = ("prova", "estudo", "entrega", "tarefa", "evento")
_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def camel(s: str) -> str:
    p = s.split("_")
    return p[0] + "".join(x.title() for x in p[1:])


def data_iso(v) -> date:
    if not isinstance(v, str):
        raise ValueError("data inválida, use AAAA-MM-DD")
    try:
        return date.fromisoformat(v)
    except ValueError:
        raise ValueError("data inválida, use AAAA-MM-DD") from None


def hora_iso(v) -> time:
    if not isinstance(v, str):
        raise ValueError("hora inválida, use HH:MM")
    try:
        return time.fromisoformat(v)
    except ValueError:
        raise ValueError("hora inválida, use HH:MM") from None


class F:
    """Um campo. tipo: str | int | bool | date | time | email | enum | ids | etapas."""

    def __init__(self, tipo, req=False, nul=False, padrao=None, min=None, max=None, valores=None):
        self.tipo, self.req, self.nul, self.padrao = tipo, req, nul, padrao
        self.min, self.max, self.valores = min, max, valores

    def converter(self, v):
        t = self.tipo
        if t == "time" and v == "":
            return None  # hora vazia = dia inteiro
        if t in ("str", "email"):
            if not isinstance(v, str):
                raise ValueError("deve ser um texto")
            if self.min is not None and len(v) < self.min:
                raise ValueError("não pode ficar em branco" if self.min == 1 else f"deve ter pelo menos {self.min} caracteres")
            if self.max is not None and len(v) > self.max:
                raise ValueError(f"deve ter no máximo {self.max} caracteres")
            if t == "email" and not _EMAIL.match(v):
                raise ValueError("e-mail inválido")
            return v
        if t == "int":
            if isinstance(v, bool) or not isinstance(v, int):
                raise ValueError("deve ser um número inteiro")
            if self.min is not None and v < self.min:
                raise ValueError(f"deve ser maior ou igual a {self.min}")
            if self.max is not None and v > self.max:
                raise ValueError(f"deve ser menor ou igual a {self.max}")
            return v
        if t == "bool":
            if not isinstance(v, bool):
                raise ValueError("deve ser verdadeiro ou falso")
            return v
        if t == "date":
            return data_iso(v)
        if t == "time":
            return hora_iso(v)
        if t == "enum":
            if v not in self.valores:
                raise ValueError("deve ser um de: " + ", ".join(self.valores))
            return v
        if t == "ids":
            if not isinstance(v, list) or any(isinstance(i, bool) or not isinstance(i, int) for i in v):
                raise ValueError("deve ser uma lista de números")
            return v
        if t == "etapas":
            return _etapas(v)
        raise ValueError("tipo desconhecido")


def _etapas(v) -> list[dict]:
    if not isinstance(v, list):
        raise ValueError("deve ser uma lista")
    saida = []
    for i, e in enumerate(v):
        if not isinstance(e, dict):
            raise ValueError(f"item {i}: formato inválido")
        eid, titulo, ok = e.get("id"), e.get("titulo"), e.get("concluida", False)
        if eid is not None and (isinstance(eid, bool) or not isinstance(eid, int)):
            raise ValueError(f"item {i}: id inválido")
        if not isinstance(titulo, str) or not 1 <= len(titulo) <= 200:
            raise ValueError(f"item {i}: titulo deve ter de 1 a 200 caracteres")
        if not isinstance(ok, bool):
            raise ValueError(f"item {i}: concluida deve ser verdadeiro ou falso")
        saida.append({"id": eid, "titulo": titulo, "concluida": ok})
    return saida


def validar(corpo: dict, esquema: dict[str, F], parcial: bool = False) -> dict:
    """Valida o JSON recebido. Aceita camelCase (e snake_case). Em modo parcial (PUT) só devolve o que foi enviado."""
    dados, erros = {}, []
    for nome, f in esquema.items():
        chave = next((k for k in (camel(nome), nome) if k in corpo), None)
        if chave is None:
            if parcial:
                continue
            if f.req:
                erros.append(f"{camel(nome)}: campo obrigatório")
            elif f.tipo in ("ids", "etapas"):
                dados[nome] = []
            else:
                dados[nome] = f.padrao
            continue
        v = corpo[chave]
        if v is None:
            if parcial or f.nul:
                dados[nome] = None
            else:
                erros.append(f"{camel(nome)}: campo obrigatório" if f.req else f"{camel(nome)}: não pode ser nulo")
            continue
        try:
            dados[nome] = f.converter(v)
        except ValueError as e:
            erros.append(f"{camel(nome)}: {e}")
    if erros:
        raise Erro(422, "; ".join(erros))
    return dados


def so_alteraveis(dados: dict, anulaveis: tuple[str, ...] = ()) -> dict:
    """Atualização parcial: campos obrigatórios enviados como null são ignorados (só os 'anulaveis' viram NULL)."""
    return {k: v for k, v in dados.items() if v is not None or k in anulaveis}
