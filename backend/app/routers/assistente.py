"""PROVISÓRIO. O Richard substitui este arquivo pela conversa completa com a Gemini.

Enquanto isso, o chat já enxerga o calendário: perguntas sobre hoje, agenda, provas, estudos, prazos
ou semana respondem com o resumo da agenda (o mesmo da mensagem diária). Outras perguntas recebem a
resposta fixa.
"""
from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession
from app.schemas.base import CamelModel
from app.services import briefing

router = APIRouter(prefix="/assistente", tags=["Assistente (provisório)"])

_PALAVRAS_AGENDA = ("hoje", "agenda", "calend", "prova", "estud", "semana", "amanh", "compromisso", "prazo", "entrega")


class MensagemIn(CamelModel):
    texto: str


class MensagemOut(CamelModel):
    texto: str


@router.post("/mensagem", response_model=MensagemOut)
def mensagem(dados: MensagemIn, db: DbSession, usuario: CurrentUser):
    pergunta = dados.texto.lower()
    if any(p in pergunta for p in _PALAVRAS_AGENDA):
        return MensagemOut(texto=briefing.montar(db, usuario).texto)
    return MensagemOut(texto="Olá! O assistente de IA ainda está em desenvolvimento. Em breve ele poderá ajudar você.")
