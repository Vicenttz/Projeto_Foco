import { Component, Input } from '@angular/core';

@Component({
  selector: 'foco-empty-state',
  standalone: true,
  template: `<div class="empty"><h3>{{ title }}</h3><p class="muted">{{ message }}</p><ng-content /></div>`,
  styles: ['.empty{text-align:center;padding:2.5rem 1rem;border:1px dashed var(--color-border);border-radius:var(--radius-lg);display:flex;flex-direction:column;gap:.5rem;align-items:center}'],
})
export class EmptyStateComponent {
  @Input() title = 'Nada por aqui ainda';
  @Input() message = '';
}
