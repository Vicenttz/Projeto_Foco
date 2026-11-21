import { Injectable, inject } from '@angular/core';
import { ApiService } from '../core/http/api.service';
import { CalendarEvent } from '../models';

/** Endpoints propostos (a confirmar com o Yan): ver docs/api-contract.md */
@Injectable({ providedIn: 'root' })
export class EventsService {
  private api = inject(ApiService);
  list() { return this.api.get<CalendarEvent[]>('/eventos'); }
  get(id: number) { return this.api.get<CalendarEvent>(`/eventos/${id}`); }
  create(data: Omit<CalendarEvent, 'id'>) { return this.api.post<CalendarEvent>('/eventos', data); }
  update(id: number, data: Partial<CalendarEvent>) { return this.api.put<CalendarEvent>(`/eventos/${id}`, data); }
  remove(id: number) { return this.api.delete<void>(`/eventos/${id}`); }
}
