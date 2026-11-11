from sqlalchemy.orm import Session

from app.models import Disciplina, Tarefa, Usuario
from app.schemas.tarefa import TarefaCreate, TarefaUpdate
from app.services.common import aplicar_atualizacao, listar_do_usuario, obter_do_usuario

MSG = "Tarefa não encontrada"


def _checar_disciplina(db: Session, u: Usuario, disciplina_id: int | None) -> None:
    if disciplina_id is not None:
        obter_do_usuario(db, Disciplina, disciplina_id, u, "Disciplina não encontrada")


def listar(db: Session, u: Usuario, status=None, prioridade=None, disciplina_id=None):
    filtros = []
    if status:
        filtros.append(Tarefa.status == status)
    if prioridade:
        filtros.append(Tarefa.prioridade == prioridade)
    if disciplina_id is not None:
        filtros.append(Tarefa.disciplina_id == disciplina_id)
    return listar_do_usuario(db, Tarefa, u, *filtros, ordem=(Tarefa.prazo, Tarefa.id))


def obter(db: Session, u: Usuario, id: int) -> Tarefa:
    return obter_do_usuario(db, Tarefa, id, u, MSG)


def criar(db: Session, u: Usuario, dados: TarefaCreate) -> Tarefa:
    _checar_disciplina(db, u, dados.disciplina_id)
    obj = Tarefa(usuario_id=u.id, **dados.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def atualizar(db: Session, u: Usuario, id: int, dados: TarefaUpdate) -> Tarefa:
    obj = obter(db, u, id)
    campos = dados.model_dump(exclude_unset=True)
    _checar_disciplina(db, u, campos.get("disciplina_id"))
    aplicar_atualizacao(obj, campos, anulaveis=("descricao", "disciplina_id"))
    if obj.status == "concluida":
        obj.em_foco = False  # tarefa concluída sai do foco
    db.commit()
    db.refresh(obj)
    return obj


def remover(db: Session, u: Usuario, id: int) -> None:
    db.delete(obter(db, u, id))
    db.commit()
