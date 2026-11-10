import { Injectable, inject } from '@angular/core';
import { ApiService } from '../core/http/api.service';
import { Project } from '../models';

/** Endpoints propostos (a confirmar com o Yan): ver docs/api-contract.md */
@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private api = inject(ApiService);
  list() { return this.api.get<Project[]>('/projetos'); }
  get(id: number) { return this.api.get<Project>(`/projetos/${id}`); }
  create(data: Omit<Project, 'id'>) { return this.api.post<Project>('/projetos', data); }
  update(id: number, data: Partial<Project>) { return this.api.put<Project>(`/projetos/${id}`, data); }
  remove(id: number) { return this.api.delete<void>(`/projetos/${id}`); }
}
