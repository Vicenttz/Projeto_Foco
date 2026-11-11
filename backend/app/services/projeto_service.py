from sqlalchemy.orm import Session, selectinload

from app.models import Projeto, ProjetoEtapa, Usuario
from app.schemas.projeto import ProjetoCreate, ProjetoUpdate
from app.services.common import aplicar_atualizacao, listar_do_usuario, obter_do_usuario, sincronizar_etapas

MSG = "Projeto não encontrado"


def listar(db: Session, u: Usuario):
    return listar_do_usuario(
        db, Projeto, u, ordem=(Projeto.data_entrega, Projeto.id), opcoes=(selectinload(Projeto.etapas),)
    )


def obter(db: Session, u: Usuario, id: int) -> Projeto:
    return obter_do_usuario(db, Projeto, id, u, MSG)


def criar(db: Session, u: Usuario, dados: ProjetoCreate) -> Projeto:
    obj = Projeto(
        usuario_id=u.id, nome=dados.nome, descricao=dados.descricao, data_entrega=dados.data_entrega, status=dados.status
    )
    db.add(obj)
    sincronizar_etapas(obj, "etapas", dados.etapas, ProjetoEtapa)
    db.commit()
    db.refresh(obj)
    return obj


def atualizar(db: Session, u: Usuario, id: int, dados: ProjetoUpdate) -> Projeto:
    obj = obter(db, u, id)
    campos = dados.model_dump(exclude_unset=True, exclude={"etapas"})
    aplicar_atualizacao(obj, campos, anulaveis=("descricao",))
    if dados.etapas is not None:
        sincronizar_etapas(obj, "etapas", dados.etapas, ProjetoEtapa)
    db.commit()
    db.refresh(obj)
    return obj


def remover(db: Session, u: Usuario, id: int) -> None:
    db.delete(obter(db, u, id))
    db.commit()
