import { Component, Input } from '@angular/core';
import { ArtComponent } from '../art/art.component';

@Component({
  selector: 'foco-empty-state',
  standalone: true,
  imports: [ArtComponent],
  template: `<div class="empty"><foco-art tipo="vazio" /><h3>{{ title }}</h3><p class="muted">{{ message }}</p><ng-content /></div>`,
  styles: [':host{display:block}.empty{text-align:center;padding:2rem 1rem;border:2px dashed var(--color-border);border-radius:var(--radius-lg);display:flex;flex-direction:column;gap:.5rem;align-items:center}'],
})
export class EmptyStateComponent {
  @Input() title = 'Nada por aqui ainda';
  @Input() message = '';
}
