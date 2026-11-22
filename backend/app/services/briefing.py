"""Mensagem diária do assistente.

O assistente LÊ a agenda do usuário (provas, estudos, entregas) e as tarefas, e monta o resumo do dia:
o que tem hoje, provas chegando, se falta agendar estudo e o que está atrasado.

- Sem chave do Gemini: texto montado por regras locais (nada sai do computador).
- Com GEMINI_API_KEY: o texto das regras é reescrito pela IA em tom mais natural. Os fatos (datas, títulos)
  vêm sempre das regras e a IA é instruída a não inventar nada. Se a chamada falhar, usa o texto das regras.
A IA nunca cria nem altera dados: ela só sugere (veja `Sugestao`).
"""
import json
import urllib.request
from datetime import date, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import Disciplina, Evento, Tarefa, Usuario
from app.schemas.briefing import BriefingOut, Destaque, Sugestao
from app.services import foco_service

HORIZONTE_DIAS = 21  # até onde a agenda é lida
MAX_SUGESTOES = 3
_SEMANA = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"]


def quando(dias: int) -> str:
    if dias == 0:
        return "hoje"
    if dias == 1:
        return "amanhã"
    return f"em {dias} dias"


def _hora(e: Evento) -> str | None:
    return e.hora.strftime("%H:%M") if e.hora else None


def _dia(d: date) -> str:
    return f"{_SEMANA[d.weekday()]}, {d.strftime('%d/%m')}"


def _plural(n: int, singular: str, plural: str) -> str:
    return f"{n} {singular if n == 1 else plural}"


def _saudacao(hora: int, nome: str) -> str:
    periodo = "Bom dia" if hora < 12 else "Boa tarde" if hora < 18 else "Boa noite"
    return f"{periodo}, {nome.split()[0] if nome.strip() else 'estudante'}!"


def _destaque(e: Evento, hoje: date, nomes: dict[int, str]) -> Destaque:
    return Destaque(
        id=e.id, tipo=e.tipo, titulo=e.titulo, data=e.data, hora=_hora(e),
        quando=quando((e.data - hoje).days), disciplina=nomes.get(e.disciplina_id) if e.disciplina_id else None,
    )


def _estudos_para(prova: Evento, estudos: list[Evento]) -> list[Evento]:
    """Sessões de estudo pendentes antes da prova. Se a prova tem disciplina, vale a mesma disciplina
    ou um estudo sem disciplina (para não cobrar quem só não preencheu o campo)."""
    return [
        s for s in estudos
        if s.data <= prova.data and (prova.disciplina_id is None or s.disciplina_id in (None, prova.disciplina_id))
    ]


def montar(db: Session, u: Usuario, hoje: date | None = None, hora: int | None = None) -> BriefingOut:
    hoje = hoje or date.today()
    hora = datetime.now().hour if hora is None else hora

    nomes = {d.id: d.nome for d in db.scalars(select(Disciplina).where(Disciplina.usuario_id == u.id))}
    eventos = list(db.scalars(
        select(Evento)
        .where(Evento.usuario_id == u.id, Evento.data >= hoje, Evento.data <= hoje + timedelta(days=HORIZONTE_DIAS))
        .order_by(Evento.data, Evento.hora, Evento.id)
    ))
    de_hoje = [e for e in eventos if e.data == hoje]
    provas = [e for e in eventos if e.tipo == "prova"]
    entregas = [e for e in eventos if e.tipo == "entrega" and not e.concluido and (e.data - hoje).days <= 7]
    estudos = [e for e in eventos if e.tipo == "estudo" and not e.concluido]

    abertas = list(db.scalars(select(Tarefa).where(Tarefa.usuario_id == u.id, Tarefa.status != "concluida")))
    atrasadas = [t for t in abertas if t.prazo < hoje]
    vencem_hoje = [t for t in abertas if t.prazo == hoje]
    foco = foco_service.escolher_atual(foco_service.prioridades(db, u))

    partes: list[str] = []
    sugestoes: list[Sugestao] = []

    # 1) Hoje
    if de_hoje:
        itens = [f"{e.titulo} às {_hora(e)}" if e.hora else e.titulo for e in de_hoje]
        partes.append("Hoje na sua agenda: " + "; ".join(itens) + ".")
    else:
        partes.append("Sua agenda de hoje está livre.")

    # 2) Provas chegando (as 2 mais próximas)
    for p in provas[:2]:
        dias = (p.data - hoje).days
        detalhe = f"{_dia(p.data)}" + (f", às {_hora(p)}" if p.hora else "")
        linha = f"{p.titulo} é {quando(dias)} ({detalhe})."
        previstos = _estudos_para(p, estudos)
        if dias == 0:
            linha += " Boa prova!"
        elif previstos:
            linha += f" Você já agendou {_plural(len(previstos), 'sessão', 'sessões')} de estudo antes dela."
        else:
            linha += " Ainda não há estudo agendado para ela."
            if len(sugestoes) < MAX_SUGESTOES:
                alvo = hoje if dias <= 1 else hoje + timedelta(days=1)
                query = {"novo": "estudo", "data": alvo.isoformat()}
                if p.disciplina_id:
                    query["disciplinaId"] = str(p.disciplina_id)
                sugestoes.append(Sugestao(texto=f"Agendar estudo para {p.titulo}", rota="/calendario", query=query))
        partes.append(linha)

    # 3) Entregas da semana
    if entregas:
        itens = [f"{e.titulo} ({quando((e.data - hoje).days)})" for e in entregas[:3]]
        partes.append("Entregas desta semana: " + "; ".join(itens) + ".")

    # 4) Tarefas
    if atrasadas:
        partes.append(f"Você tem {_plural(len(atrasadas), 'tarefa atrasada', 'tarefas atrasadas')}.")
        if len(sugestoes) < MAX_SUGESTOES:
            sugestoes.append(Sugestao(texto="Ver tarefas atrasadas", rota="/tarefas"))
    if vencem_hoje:
        partes.append(f"{_plural(len(vencem_hoje), 'tarefa vence', 'tarefas vencem')} hoje.")
    if foco:
        partes.append(f"Seu foco agora: {foco.titulo}.")

    # 5) Nada agendado para estudar
    if not provas and not estudos and len(sugestoes) < MAX_SUGESTOES:
        partes.append("Que tal reservar um horário de estudo hoje?")
        sugestoes.append(Sugestao(texto="Agendar uma sessão de estudo", rota="/calendario",
                                  query={"novo": "estudo", "data": hoje.isoformat()}))

    saudacao = _saudacao(hora, u.nome)
    texto = "\n".join(partes)
    gerado_por = "regras"
    reescrito = _reescrever_com_ia(saudacao, texto)
    if reescrito:
        texto, gerado_por = reescrito, "gemini"

    proximos = [e for e in eventos if e.data > hoje][:5]
    return BriefingOut(
        data=hoje, saudacao=saudacao, texto=texto,
        hoje=[_destaque(e, hoje, nomes) for e in de_hoje],
        proximos=[_destaque(e, hoje, nomes) for e in proximos],
        sugestoes=sugestoes, gerado_por=gerado_por,
    )


def _reescrever_com_ia(saudacao: str, texto_base: str) -> str | None:
    """Opcional: pede ao Gemini para reescrever o resumo em tom amigável. Devolve None se não estiver
    configurado ou se qualquer coisa falhar (o chamador usa o texto das regras)."""
    s = get_settings()
    if not s.GEMINI_API_KEY:
        return None
    prompt = (
        "Você é o assistente de estudos do app FOCO. Reescreva o resumo abaixo como uma mensagem curta, "
        "amigável e motivadora em português do Brasil (no máximo 4 frases). Use SOMENTE os fatos do resumo: "
        "não invente datas, horários, provas ou tarefas. Não diga que alterou nada na agenda. "
        f"Comece sem repetir a saudação ({saudacao}).\n\nResumo:\n{texto_base}"
    )
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{s.GEMINI_MODEL}:generateContent"
    req = urllib.request.Request(
        url,
        data=json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": s.GEMINI_API_KEY},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as r:
            dados = json.loads(r.read().decode("utf-8"))
        texto = dados["candidates"][0]["content"]["parts"][0]["text"].strip()
        return texto or None
    except Exception:  # noqa: BLE001  (rede, cota, formato inesperado: cai no texto das regras)
        return None
