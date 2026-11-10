import { Component } from '@angular/core';
import { MOCK_DISCIPLINES } from '../../mocks/mock-data';
import { IconComponent } from '../../shared/icon/icon.component';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';

@Component({
  selector: 'foco-disciplinas', standalone: true, imports: [IconComponent, ProgressBarComponent],
  template: `<div class="stack"><div class="row-between"><h1>Disciplinas</h1>
    <button class="btn"><foco-icon name="plus" />Nova disciplina</button></div>
    <div class="grid">@for (d of disciplinas; track d.id) {
      <article class="card stack"><h3>{{ d.nome }}</h3><p class="muted">{{ d.professor }}</p><foco-progress [value]="d.progresso" [label]="'Progresso em ' + d.nome" />
        <button class="btn btn-secondary">Ver detalhes</button></article> }</div></div>`,
})
export class DisciplinasComponent { disciplinas = MOCK_DISCIPLINES; }
