"""PROVISÓRIO. Resposta fixa; o Richard substitui este arquivo pela integração com a Gemini."""
from fastapi import APIRouter

from app.dependencies import CurrentUser
from app.schemas.base import CamelModel

router = APIRouter(prefix="/assistente", tags=["Assistente (provisório)"])


class MensagemIn(CamelModel):
    texto: str


class MensagemOut(CamelModel):
    texto: str


@router.post("/mensagem", response_model=MensagemOut)
def mensagem(dados: MensagemIn, usuario: CurrentUser):
    return MensagemOut(texto="Olá! O assistente de IA ainda está em desenvolvimento. Em breve ele poderá ajudar você.")
