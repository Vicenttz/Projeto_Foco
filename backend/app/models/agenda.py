from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Tarefa(Base):
    __tablename__ = "tarefas"

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    disciplina_id: Mapped[int | None] = mapped_column(ForeignKey("disciplinas.id", ondelete="SET NULL"), nullable=True)
    titulo: Mapped[str] = mapped_column(String(200))
    descricao: Mapped[str | None] = mapped_column(Text, nullable=True)
    prioridade: Mapped[str] = mapped_column(String(10), default="media")
    prazo: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), default="pendente")
    em_foco: Mapped[bool] = mapped_column(Boolean, default=False)  # no máximo 1 por usuário

    disciplina = relationship("Disciplina", back_populates="tarefas")


class Evento(Base):
    __tablename__ = "eventos"

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    titulo: Mapped[str] = mapped_column(String(200))
    data: Mapped[date] = mapped_column(Date)
    tipo: Mapped[str] = mapped_column(String(20), default="evento")
