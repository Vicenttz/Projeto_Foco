import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MOCK_EVENTS } from '../../mocks/mock-data';
import { BadgeComponent } from '../../shared/badge/badge.component';

/** Visão em lista por data. Calendário mensal completo fica como próximo passo. */
@Component({
  selector: 'foco-calendario', standalone: true, imports: [DatePipe, BadgeComponent],
  template: `<div class="stack"><h1>Calendário</h1>
    @for (e of eventos; track e.id) { <article class="card row-between"><div><h3>{{ e.titulo }}</h3>
      <p class="muted">{{ e.data | date:'EEEE, dd/MM/yyyy' }}</p></div><foco-badge>{{ e.tipo }}</foco-badge></article> }</div>`,
})
export class CalendarioComponent { eventos = [...MOCK_EVENTS].sort((a, b) => a.data.localeCompare(b.data)); }
