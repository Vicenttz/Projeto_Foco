import { Component, Input } from '@angular/core';
<<<<<<< HEAD
import { ArtComponent } from '../art/art.component';
=======
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca

@Component({
  selector: 'foco-empty-state',
  standalone: true,
<<<<<<< HEAD
  imports: [ArtComponent],
  template: `<div class="empty"><foco-art tipo="vazio" /><h3>{{ title }}</h3><p class="muted">{{ message }}</p><ng-content /></div>`,
  styles: [':host{display:block}.empty{text-align:center;padding:2rem 1rem;border:2px dashed var(--color-border);border-radius:var(--radius-lg);display:flex;flex-direction:column;gap:.5rem;align-items:center}'],
=======
  template: `<div class="empty"><h3>{{ title }}</h3><p class="muted">{{ message }}</p><ng-content /></div>`,
  styles: ['.empty{text-align:center;padding:2.5rem 1rem;border:1px dashed var(--color-border);border-radius:var(--radius-lg);display:flex;flex-direction:column;gap:.5rem;align-items:center}'],
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
})
export class EmptyStateComponent {
  @Input() title = 'Nada por aqui ainda';
  @Input() message = '';
}
