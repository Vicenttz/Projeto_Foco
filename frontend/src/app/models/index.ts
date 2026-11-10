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
