// DADOS FICTÍCIOS (mock) apenas para visualizar as telas. Serão substituídos pela API.
import { CalendarEvent, Discipline, Project, Task, Trail } from '../models';

export const MOCK_USER = { id: 1, nome: 'Estudante', email: 'estudante@exemplo.com' };
export const MOCK_DISCIPLINES: Discipline[] = [
  { id: 1, nome: 'Cálculo I', professor: 'Prof. Silva', progresso: 62 },
  { id: 2, nome: 'Programação Web', professor: 'Prof. Costa', progresso: 80 },
  { id: 3, nome: 'Banco de Dados', professor: 'Prof. Lima', progresso: 35 },
];
export const MOCK_TASKS: Task[] = [
  { id: 1, titulo: 'Lista de exercícios 3', descricao: 'Derivadas e limites', disciplinaId: 1, prioridade: 'alta', prazo: '2026-11-12', status: 'pendente' },
  { id: 2, titulo: 'Protótipo da interface', disciplinaId: 2, prioridade: 'media', prazo: '2026-11-15', status: 'em_andamento' },
  { id: 3, titulo: 'Modelagem do DER', disciplinaId: 3, prioridade: 'baixa', prazo: '2026-11-20', status: 'concluida' },
];
export const MOCK_PROJECTS: Project[] = [
  { id: 1, nome: 'Projeto FOCO', descricao: 'Plataforma de organização de estudos', dataEntrega: '2026-12-05', progresso: 40, status: 'em_andamento',
    etapas: [{ id: 1, titulo: 'Identidade visual', concluida: true }, { id: 2, titulo: 'Frontend', concluida: false }, { id: 3, titulo: 'Backend', concluida: false }] },
];
export const MOCK_TRAILS: Trail[] = [
  { id: 1, assunto: 'Fundamentos de Angular', progresso: 50,
    etapas: [{ id: 1, titulo: 'Componentes', concluida: true }, { id: 2, titulo: 'Rotas', concluida: true }, { id: 3, titulo: 'Serviços HTTP', concluida: false }, { id: 4, titulo: 'Formulários', concluida: false }] },
];
export const MOCK_EVENTS: CalendarEvent[] = [
  { id: 1, titulo: 'Prova de Cálculo', data: '2026-11-18', tipo: 'evento' },
  { id: 2, titulo: 'Entrega do protótipo', data: '2026-11-15', tipo: 'entrega' },
  { id: 3, titulo: 'Sessão de estudo: SQL', data: '2026-11-13', tipo: 'estudo' },
];
