import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Step } from '../../models';
import { IconComponent } from '../icon/icon.component';

/** Lista editável de etapas (projetos e trilhas). Edita o array recebido diretamente. */
@Component({
  selector: 'foco-steps-editor',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `<div class="stack" style="gap:.5rem">
    @for (e of etapas; track $index) {
      <div class="row" style="flex-wrap:nowrap">
        <input type="checkbox" [(ngModel)]="e.concluida" [attr.aria-label]="'Concluída: ' + e.titulo" />
        <input class="grow" [(ngModel)]="e.titulo" placeholder="Nome da etapa" [attr.aria-label]="'Etapa ' + ($index + 1)" />
        <button class="btn btn-ghost btn-icon" type="button" (click)="etapas.splice($index, 1)" aria-label="Remover etapa"><foco-icon name="trash" [size]="18" /></button>
      </div>
    }
    <button class="btn btn-secondary btn-sm" type="button" (click)="etapas.push({ titulo: '', concluida: false })"><foco-icon name="plus" [size]="16" />Adicionar etapa</button>
  </div>`,
})
export class StepsEditorComponent { @Input() etapas: Step[] = []; }
