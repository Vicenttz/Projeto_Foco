import { Injectable, inject } from '@angular/core';
import { ApiService } from '../core/http/api.service';
import { Trail } from '../models';

/** Endpoints propostos (a confirmar com o Yan): ver docs/api-contract.md */
@Injectable({ providedIn: 'root' })
export class TrailsService {
  private api = inject(ApiService);
  list() { return this.api.get<Trail[]>('/trilhas'); }
  get(id: number) { return this.api.get<Trail>(`/trilhas/${id}`); }
<<<<<<< HEAD
  create(data: Omit<Trail, 'id' | 'progresso'>) { return this.api.post<Trail>('/trilhas', data); }
=======
  create(data: Omit<Trail, 'id'>) { return this.api.post<Trail>('/trilhas', data); }
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
  update(id: number, data: Partial<Trail>) { return this.api.put<Trail>(`/trilhas/${id}`, data); }
  remove(id: number) { return this.api.delete<void>(`/trilhas/${id}`); }
}
