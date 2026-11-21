from app.schemas.base import CamelModel
from app.schemas.disciplina import DisciplinaOut
from app.schemas.evento import EventoOut
from app.schemas.projeto import ProjetoOut
from app.schemas.tarefa import TarefaOut
from app.schemas.usuario import UserOut


class FocoOut(CamelModel):
    atual: TarefaOut | None = None
    progresso: int  # 0, 50 ou 100 conforme o status da tarefa em foco
    prioridades: list[TarefaOut]


class ResumoTarefas(CamelModel):
    total: int
    pendentes: int  # tudo que ainda não foi concluído (inclui em andamento)
    em_andamento: int
    concluidas: int
    percentual_concluidas: int


class DashboardOut(CamelModel):
    usuario: UserOut
    foco_atual: TarefaOut | None = None
    resumo_tarefas: ResumoTarefas
    proximas_tarefas: list[TarefaOut]
    disciplinas: list[DisciplinaOut]
    projetos_ativos: list[ProjetoOut]
    proximos_eventos: list[EventoOut]
