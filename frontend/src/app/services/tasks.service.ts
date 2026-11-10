import { Injectable, inject } from '@angular/core';
import { ApiService } from '../core/http/api.service';
import { Task } from '../models';

/** Endpoints propostos (a confirmar com o Yan): ver docs/api-contract.md */
@Injectable({ providedIn: 'root' })
export class TasksService {
  private api = inject(ApiService);
  list() { return this.api.get<Task[]>('/tarefas'); }
  get(id: number) { return this.api.get<Task>(`/tarefas/${id}`); }
  create(data: Omit<Task, 'id'>) { return this.api.post<Task>('/tarefas', data); }
  update(id: number, data: Partial<Task>) { return this.api.put<Task>(`/tarefas/${id}`, data); }
  remove(id: number) { return this.api.delete<void>(`/tarefas/${id}`); }
}
