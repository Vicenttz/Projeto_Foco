// Contratos TypeScript do FOCO (espelham docs/api-contract.md).
export type Priority = 'baixa' | 'media' | 'alta';
export type TaskStatus = 'pendente' | 'em_andamento' | 'concluida';
export type Papel = 'usuario' | 'admin';

export interface User { id: number; nome: string; email: string; papel?: Papel; }
export interface Discipline { id: number; nome: string; professor?: string | null; cor?: string | null; progresso: number; }
export interface Task { id: number; titulo: string; descricao?: string | null; disciplinaId?: number | null; prioridade: Priority; prazo: string; status: TaskStatus; }
export interface Step { id?: number; titulo: string; concluida: boolean; }
export interface Project { id: number; nome: string; descricao?: string | null; dataEntrega: string; progresso: number; status: TaskStatus; etapas: Step[]; }
export interface Trail { id: number; assunto: string; progresso: number; etapas: Step[]; }
export type EventType = 'prova' | 'estudo' | 'entrega' | 'tarefa' | 'evento';
/** Compromisso do calendário. hora = "HH:MM" (sem hora = dia inteiro); concluido vale para sessões de estudo. */
export interface CalendarEvent {
  id: number; titulo: string; data: string; tipo: EventType;
  hora?: string | null; duracaoMin?: number | null; disciplinaId?: number | null; descricao?: string | null; concluido?: boolean;
}
export interface ChatMessage { autor: 'usuario' | 'assistente'; texto: string; }

/** Mensagem do dia (GET /assistente/diario): o assistente lê a agenda e resume o que importa hoje. */
export interface BriefingDestaque { id: number; tipo: EventType; titulo: string; data: string; hora?: string | null; quando: string; disciplina?: string | null; }
export interface BriefingSugestao { texto: string; rota?: string | null; query?: Record<string, string> | null; }
export interface Briefing {
  data: string; saudacao: string; texto: string;
  hoje: BriefingDestaque[]; proximos: BriefingDestaque[]; sugestoes: BriefingSugestao[]; geradoPor: 'regras' | 'gemini';
}

export interface Dashboard {
  usuario: User; focoAtual: Task | null;
  resumoTarefas: { total: number; pendentes: number; emAndamento: number; concluidas: number; percentualConcluidas: number };
  proximasTarefas: Task[]; disciplinas: Discipline[]; projetosAtivos: Project[]; proximosEventos: CalendarEvent[];
}
export interface FocoInfo { atual: Task | null; progresso: number; prioridades: Task[]; }

export interface AdminUsuario { id: number; nome: string; email: string; papel: Papel; criadoEm?: string; totalTarefas: number; totalDisciplinas: number; totalProjetos: number; }
export interface AdminResumo { totalUsuarios: number; totalAdmins: number; totalTarefas: number; tarefasConcluidas: number; totalDisciplinas: number; totalProjetos: number; totalTrilhas: number; totalEventos: number; }
