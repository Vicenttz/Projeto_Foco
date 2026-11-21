import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'foco-modal',
  standalone: true,
  imports: [IconComponent],
  template: `<div class="modal-backdrop" (click)="fechar.emit()">
    <div class="modal" role="dialog" aria-modal="true" [attr.aria-label]="titulo" (click)="$event.stopPropagation()">
      <div class="row-between"><h2>{{ titulo }}</h2><button class="btn btn-ghost btn-icon" type="button" (click)="fechar.emit()" aria-label="Fechar"><foco-icon name="close" /></button></div>
      <ng-content />
    </div></div>`,
})
export class ModalComponent {
  @Input() titulo = '';
  @Output() fechar = new EventEmitter<void>();
  @HostListener('document:keydown.escape') esc() { this.fechar.emit(); }
}
