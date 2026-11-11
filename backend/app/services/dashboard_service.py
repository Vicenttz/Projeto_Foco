from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Disciplina, Evento, Projeto, Tarefa, Usuario
from app.schemas.disciplina import DisciplinaOut
from app.schemas.evento import EventoOut
from app.schemas.foco import DashboardOut, ResumoTarefas
from app.schemas.projeto import ProjetoOut
from app.schemas.tarefa import TarefaOut
from app.schemas.usuario import UserOut
from app.services import foco_service

LIMITE = 5


def montar(db: Session, u: Usuario) -> DashboardOut:
    tarefas = list(db.scalars(select(Tarefa).where(Tarefa.usuario_id == u.id)).all())
    total = len(tarefas)
    concluidas = sum(1 for t in tarefas if t.status == "concluida")
    em_andamento = sum(1 for t in tarefas if t.status == "em_andamento")
    abertas = sorted((t for t in tarefas if t.status != "concluida"), key=lambda t: (t.prazo, t.id))

    atual = foco_service.escolher_atual(foco_service.prioridades(db, u))
    disciplinas = db.scalars(
        select(Disciplina)
        .where(Disciplina.usuario_id == u.id)
        .options(selectinload(Disciplina.tarefas))
        .order_by(Disciplina.nome)
    ).all()
    projetos = db.scalars(
        select(Projeto)
        .where(Projeto.usuario_id == u.id, Projeto.status != "concluida")
        .options(selectinload(Projeto.etapas))
        .order_by(Projeto.data_entrega, Projeto.id)
    ).all()
    eventos = db.scalars(
        select(Evento)
        .where(Evento.usuario_id == u.id, Evento.data >= date.today())
        .order_by(Evento.data, Evento.id)
        .limit(LIMITE)
    ).all()

    return DashboardOut(
        usuario=UserOut.model_validate(u),
        foco_atual=TarefaOut.model_validate(atual) if atual else None,
        resumo_tarefas=ResumoTarefas(
            total=total,
            pendentes=total - concluidas,
            em_andamento=em_andamento,
            concluidas=concluidas,
            percentual_concluidas=round(100 * concluidas / total) if total else 0,
        ),
        proximas_tarefas=[TarefaOut.model_validate(t) for t in abertas[:LIMITE]],
        disciplinas=[DisciplinaOut.model_validate(d) for d in disciplinas],
        projetos_ativos=[ProjetoOut.model_validate(p) for p in projetos],
        proximos_eventos=[EventoOut.model_validate(e) for e in eventos],
    )
