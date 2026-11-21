<<<<<<< HEAD
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
export type EventType = 'tarefa' | 'entrega' | 'evento' | 'estudo';
export interface CalendarEvent { id: number; titulo: string; data: string; tipo: EventType; }
export interface ChatMessage { autor: 'usuario' | 'assistente'; texto: string; }

export interface Dashboard {
  usuario: User; focoAtual: Task | null;
  resumoTarefas: { total: number; pendentes: number; emAndamento: number; concluidas: number; percentualConcluidas: number };
  proximasTarefas: Task[]; disciplinas: Discipline[]; projetosAtivos: Project[]; proximosEventos: CalendarEvent[];
}
export interface FocoInfo { atual: Task | null; progresso: number; prioridades: Task[]; }

export interface AdminUsuario { id: number; nome: string; email: string; papel: Papel; criadoEm?: string; totalTarefas: number; totalDisciplinas: number; totalProjetos: number; }
export interface AdminResumo { totalUsuarios: number; totalAdmins: number; totalTarefas: number; tarefasConcluidas: number; totalDisciplinas: number; totalProjetos: number; totalTrilhas: number; totalEventos: number; }
=======
// Contratos TypeScript do FOCO. Devem ser revisados com o backend (Yan) e o banco (Richard).
export type Priority = 'baixa' | 'media' | 'alta';
export type TaskStatus = 'pendente' | 'em_andamento' | 'concluida';

export interface User { id: number; nome: string; email: string; }
export interface Discipline { id: number; nome: string; professor?: string; cor?: string; progresso: number; }
export interface Task { id: number; titulo: string; descricao?: string; disciplinaId?: number; prioridade: Priority; prazo: string; status: TaskStatus; }
export interface ProjectStep { id: number; titulo: string; concluida: boolean; }
export interface Project { id: number; nome: string; descricao?: string; dataEntrega: string; progresso: number; status: TaskStatus; etapas: ProjectStep[]; }
export interface TrailStep { id: number; titulo: string; concluida: boolean; }
export interface Trail { id: number; assunto: string; progresso: number; etapas: TrailStep[]; }
export type EventType = 'tarefa' | 'entrega' | 'evento' | 'estudo';
export interface CalendarEvent { id: number; titulo: string; data: string; tipo: EventType; }
export interface ChatMessage { autor: 'usuario' | 'assistente'; texto: string; }
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
