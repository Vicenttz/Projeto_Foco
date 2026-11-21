"""Área administrativa: só para usuários com papel "admin"."""
from fastapi import APIRouter, HTTPException
from sqlalchemy import func, select

from app.dependencies import AdminUser, DbSession
from app.models import Disciplina, Evento, Projeto, Tarefa, Trilha, Usuario
from app.schemas.admin import AdminResumo, AdminUsuarioOut, AdminUsuarioUpdate

router = APIRouter(prefix="/admin", tags=["Administração"])


def _contar(db, modelo, filtro=None) -> int:
    stmt = select(func.count()).select_from(modelo)
    if filtro is not None:
        stmt = stmt.where(filtro)
    return db.scalar(stmt) or 0


def _por_usuario(db, modelo) -> dict[int, int]:
    return dict(db.execute(select(modelo.usuario_id, func.count()).group_by(modelo.usuario_id)).all())


@router.get("/resumo", response_model=AdminResumo)
def resumo(db: DbSession, _: AdminUser):
    return AdminResumo(
        total_usuarios=_contar(db, Usuario),
        total_admins=_contar(db, Usuario, Usuario.papel == "admin"),
        total_tarefas=_contar(db, Tarefa),
        tarefas_concluidas=_contar(db, Tarefa, Tarefa.status == "concluida"),
        total_disciplinas=_contar(db, Disciplina),
        total_projetos=_contar(db, Projeto),
        total_trilhas=_contar(db, Trilha),
        total_eventos=_contar(db, Evento),
    )


@router.get("/usuarios", response_model=list[AdminUsuarioOut])
def listar_usuarios(db: DbSession, _: AdminUser):
    tarefas, discs, projs = _por_usuario(db, Tarefa), _por_usuario(db, Disciplina), _por_usuario(db, Projeto)
    return [
        AdminUsuarioOut(
            id=u.id, nome=u.nome, email=u.email, papel=u.papel, criado_em=u.criado_em,
            total_tarefas=tarefas.get(u.id, 0), total_disciplinas=discs.get(u.id, 0), total_projetos=projs.get(u.id, 0),
        )
        for u in db.scalars(select(Usuario).order_by(Usuario.id)).all()
    ]


@router.put("/usuarios/{id}", response_model=AdminUsuarioOut)
def alterar_papel(id: int, dados: AdminUsuarioUpdate, db: DbSession, admin: AdminUser):
    alvo = db.get(Usuario, id)
    if alvo is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if alvo.id == admin.id and dados.papel != "admin":
        raise HTTPException(status_code=422, detail="Você não pode remover o seu próprio acesso de administrador")
    alvo.papel = dados.papel
    db.commit()
    db.refresh(alvo)
    return AdminUsuarioOut(id=alvo.id, nome=alvo.nome, email=alvo.email, papel=alvo.papel, criado_em=alvo.criado_em)


@router.delete("/usuarios/{id}", status_code=204)
def remover_usuario(id: int, db: DbSession, admin: AdminUser):
    alvo = db.get(Usuario, id)
    if alvo is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if alvo.id == admin.id:
        raise HTTPException(status_code=422, detail="Você não pode excluir a sua própria conta")
    # Apaga também os dados do usuário (o SQLite/MySQL cuidam do CASCADE; aqui garantimos nos dois).
    for modelo in (Evento, Trilha, Projeto, Tarefa, Disciplina):
        for obj in db.scalars(select(modelo).where(modelo.usuario_id == alvo.id)).all():
            db.delete(obj)
    db.flush()
    db.delete(alvo)
    db.commit()
