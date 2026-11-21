from fastapi import HTTPException
from sqlalchemy import case, select
from sqlalchemy.orm import Session

from app.models import Tarefa, Usuario
from app.schemas.foco import FocoOut
from app.schemas.tarefa import TarefaOut
from app.services.common import obter_do_usuario

_ORDEM_PRIORIDADE = case((Tarefa.prioridade == "alta", 0), (Tarefa.prioridade == "media", 1), else_=2)
_PROGRESSO = {"pendente": 0, "em_andamento": 50, "concluida": 100}


def prioridades(db: Session, u: Usuario) -> list[Tarefa]:
    """Tarefas não concluídas: prioridade (alta > média > baixa), depois prazo mais próximo."""
    stmt = (
        select(Tarefa)
        .where(Tarefa.usuario_id == u.id, Tarefa.status != "concluida")
        .order_by(_ORDEM_PRIORIDADE, Tarefa.prazo, Tarefa.id)
    )
    return list(db.scalars(stmt).all())


def escolher_atual(lista: list[Tarefa]) -> Tarefa | None:
    """Foco escolhido pelo usuário; se não houver, a tarefa mais prioritária."""
    return next((t for t in lista if t.em_foco), lista[0] if lista else None)


def _montar(lista: list[Tarefa]) -> FocoOut:
    atual = escolher_atual(lista)
    return FocoOut(
        atual=TarefaOut.model_validate(atual) if atual else None,
        progresso=_PROGRESSO[atual.status] if atual else 0,
        prioridades=[TarefaOut.model_validate(t) for t in lista],
    )


def obter(db: Session, u: Usuario) -> FocoOut:
    return _montar(prioridades(db, u))


def definir(db: Session, u: Usuario, tarefa_id: int) -> FocoOut:
    tarefa = obter_do_usuario(db, Tarefa, tarefa_id, u, "Tarefa não encontrada")
    if tarefa.status == "concluida":
        raise HTTPException(status_code=422, detail="Tarefa concluída não pode ser o foco")
    for outra in db.scalars(select(Tarefa).where(Tarefa.usuario_id == u.id, Tarefa.em_foco.is_(True))):
        outra.em_foco = False
    tarefa.em_foco = True
    db.commit()
    return obter(db, u)


def limpar(db: Session, u: Usuario) -> None:
    for t in db.scalars(select(Tarefa).where(Tarefa.usuario_id == u.id, Tarefa.em_foco.is_(True))):
        t.em_foco = False
    db.commit()
