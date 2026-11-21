from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _percentual(feitos: int, total: int) -> int:
    return round(100 * feitos / total) if total else 0


class Disciplina(Base):
    __tablename__ = "disciplinas"

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    nome: Mapped[str] = mapped_column(String(100))
    professor: Mapped[str | None] = mapped_column(String(100), nullable=True)
    cor: Mapped[str | None] = mapped_column(String(20), nullable=True)

    tarefas = relationship("Tarefa", back_populates="disciplina")

    @property
    def progresso(self) -> int:
        """Calculado: % de tarefas concluídas da disciplina (decisão a alinhar com o Richard)."""
        return _percentual(sum(1 for t in self.tarefas if t.status == "concluida"), len(self.tarefas))


class Projeto(Base):
    __tablename__ = "projetos"

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    nome: Mapped[str] = mapped_column(String(150))
    descricao: Mapped[str | None] = mapped_column(Text, nullable=True)
    data_entrega: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), default="pendente")

    etapas = relationship(
        "ProjetoEtapa", cascade="all, delete-orphan", order_by="ProjetoEtapa.ordem", back_populates="projeto"
    )

    @property
    def progresso(self) -> int:
        return _percentual(sum(1 for e in self.etapas if e.concluida), len(self.etapas))


class ProjetoEtapa(Base):
    __tablename__ = "projeto_etapas"

    id: Mapped[int] = mapped_column(primary_key=True)
    projeto_id: Mapped[int] = mapped_column(ForeignKey("projetos.id", ondelete="CASCADE"), index=True)
    titulo: Mapped[str] = mapped_column(String(200))
    concluida: Mapped[bool] = mapped_column(Boolean, default=False)
    ordem: Mapped[int] = mapped_column(Integer, default=0)

    projeto = relationship("Projeto", back_populates="etapas")


class Trilha(Base):
    __tablename__ = "trilhas"

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    assunto: Mapped[str] = mapped_column(String(200))

    etapas = relationship(
        "TrilhaEtapa", cascade="all, delete-orphan", order_by="TrilhaEtapa.ordem", back_populates="trilha"
    )

    @property
    def progresso(self) -> int:
        return _percentual(sum(1 for e in self.etapas if e.concluida), len(self.etapas))


class TrilhaEtapa(Base):
    __tablename__ = "trilha_etapas"

    id: Mapped[int] = mapped_column(primary_key=True)
    trilha_id: Mapped[int] = mapped_column(ForeignKey("trilhas.id", ondelete="CASCADE"), index=True)
    titulo: Mapped[str] = mapped_column(String(200))
    concluida: Mapped[bool] = mapped_column(Boolean, default=False)
    ordem: Mapped[int] = mapped_column(Integer, default=0)

    trilha = relationship("Trilha", back_populates="etapas")
