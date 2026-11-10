import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MOCK_TASKS } from '../../mocks/mock-data';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';

@Component({
  selector: 'foco-foco', standalone: true, imports: [DatePipe, BadgeComponent, ProgressBarComponent],
  template: `<div class="stack"><h1>Foco e prioridades</h1>
    <section class="card stack"><h3>Foco atual</h3><p>{{ atual.titulo }}</p><foco-progress [value]="40" label="Progresso do foco" /></section>
    <h2>Prioridades</h2>
    @for (t of prioritarias; track t.id) { <article class="card row-between"><span>{{ t.titulo }}</span>
      <span class="row"><foco-badge [tone]="t.prioridade">{{ t.prioridade }}</foco-badge><span class="muted">{{ t.prazo | date:'dd/MM' }}</span></span></article> }</div>`,
})
export class FocoComponent {
  prioritarias = MOCK_TASKS.filter(t => t.status !== 'concluida');
  atual = this.prioritarias[0];
}
