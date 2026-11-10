import { Component } from '@angular/core';
import { MOCK_TRAILS } from '../../mocks/mock-data';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';

@Component({
  selector: 'foco-trilhas', standalone: true, imports: [ProgressBarComponent],
  template: `<div class="stack"><h1>Trilhas de aprendizagem</h1>
    @for (t of trilhas; track t.id) {
      <article class="card stack"><h3>{{ t.assunto }}</h3><foco-progress [value]="t.progresso" [label]="t.assunto" />
        <ol class="steps">@for (e of t.etapas; track e.id) { <li [class.done]="e.concluida">{{ e.titulo }}</li> }</ol></article> }</div>`,
  styles: ['.steps{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.75rem;border-left:2px solid var(--color-primary-soft);padding-left:1rem}.done{color:var(--color-success)}'],
})
export class TrilhasComponent { trilhas = MOCK_TRAILS; }
