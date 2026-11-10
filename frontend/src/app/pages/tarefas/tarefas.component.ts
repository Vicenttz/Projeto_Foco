import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MOCK_DISCIPLINES, MOCK_TASKS } from '../../mocks/mock-data';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'foco-tarefas', standalone: true, imports: [DatePipe, BadgeComponent, IconComponent],
  template: `<div class="stack"><div class="row-between"><h1>Tarefas</h1>
    <button class="btn"><foco-icon name="plus" />Nova tarefa</button></div>
    @for (t of tarefas; track t.id) {
      <article class="card row-between"><div class="stack" style="gap:.25rem">
        <h3>{{ t.titulo }}</h3><p class="muted">{{ t.descricao }} {{ disciplina(t.disciplinaId) }}</p></div>
        <div class="row"><foco-badge [tone]="t.prioridade">{{ t.prioridade }}</foco-badge>
          <span class="muted">{{ t.prazo | date:'dd/MM/yyyy' }}</span><foco-badge>{{ t.status.replace('_',' ') }}</foco-badge>
          <button class="btn btn-secondary">Editar</button><button class="btn btn-ghost"><foco-icon name="check" />Concluir</button></div></article> }</div>`,
})
export class TarefasComponent {
  tarefas = MOCK_TASKS;
  disciplina(id?: number) { return MOCK_DISCIPLINES.find(d => d.id === id)?.nome ?? ''; }
}
