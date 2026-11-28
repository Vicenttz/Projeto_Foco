"""Assistente: mensagem do dia (lê a agenda) e chat provisório (o Richard substitui pela conversa completa com a Gemini)."""
from .. import briefing
from ..erros import Erro
from ..roteador import rota
from ..validacao import F, validar

_PALAVRAS_AGENDA = ("hoje", "agenda", "calend", "prova", "estud", "semana", "amanh", "compromisso", "prazo", "entrega")


@rota("GET", "/assistente/diario")
def diario(ctx):
    """`data` (AAAA-MM-DD) e `hora` (0-23) são opcionais: o frontend manda os do navegador do usuário."""
    return briefing.montar(ctx, ctx.q_data("data"), ctx.q_int("hora", ge=0, le=23))


@rota("POST", "/assistente/mensagem")
def mensagem(ctx):
    d = validar(ctx.corpo, {"texto": F("str", req=True)})
    if any(p in d["texto"].lower() for p in _PALAVRAS_AGENDA):
        return {"texto": briefing.montar(ctx)["texto"]}
    return {"texto": "Olá! O assistente de IA ainda está em desenvolvimento. Em breve ele poderá ajudar você."}
