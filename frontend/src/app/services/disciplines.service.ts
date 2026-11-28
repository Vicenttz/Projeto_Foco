import { Injectable, inject } from '@angular/core';
import { ApiService } from '../core/http/api.service';
import { Discipline } from '../models';

/** Dados enviados ao criar/editar. trilhaIds: trilhas vinculadas (opcional; a lista substitui os vínculos). */
export interface DisciplineInput { nome: string; professor?: string | null; cor?: string | null; descricao?: string | null; trilhaIds?: number[]; }

/** Endpoints propostos (a confirmar com o Yan): ver docs/api-contract.md */
@Injectable({ providedIn: 'root' })
export class DisciplinesService {
  private api = inject(ApiService);
  list() { return this.api.get<Discipline[]>('/disciplinas'); }
  get(id: number) { return this.api.get<Discipline>(`/disciplinas/${id}`); }
  create(data: DisciplineInput) { return this.api.post<Discipline>('/disciplinas', data); }
  update(id: number, data: Partial<DisciplineInput>) { return this.api.put<Discipline>(`/disciplinas/${id}`, data); }
  remove(id: number) { return this.api.delete<void>(`/disciplinas/${id}`); }
}
