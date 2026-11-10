import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MOCK_PROJECTS } from '../../mocks/mock-data';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';

@Component({
  selector: 'foco-projetos', standalone: true, imports: [DatePipe, BadgeComponent, ProgressBarComponent],
  template: `<div class="stack"><h1>Projetos</h1>
    @for (p of projetos; track p.id) {
      <article class="card stack"><div class="row-between"><h3>{{ p.nome }}</h3><foco-badge>{{ p.status.replace('_',' ') }}</foco-badge></div>
        <p class="muted">{{ p.descricao }} · entrega em {{ p.dataEntrega | date:'dd/MM/yyyy' }}</p>
        <foco-progress [value]="p.progresso" [label]="'Progresso de ' + p.nome" />
        <ul>@for (e of p.etapas; track e.id) { <li>{{ e.concluida ? '✓' : '○' }} {{ e.titulo }}</li> }</ul></article> }</div>`,
})
export class ProjetosComponent { projetos = MOCK_PROJECTS; }
