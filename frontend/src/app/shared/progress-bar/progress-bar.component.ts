import { Component, Input } from '@angular/core';

@Component({
  selector: 'foco-progress',
  standalone: true,
  template: `<div class="track" role="progressbar" [attr.aria-valuenow]="value" aria-valuemin="0" aria-valuemax="100" [attr.aria-label]="label">
    <div class="fill" [style.width.%]="value"></div></div><span class="muted">{{ value }}%</span>`,
  styles: [':host{display:flex;align-items:center;gap:.6rem}.track{flex:1;height:8px;border-radius:999px;background:var(--color-border);overflow:hidden}.fill{height:100%;background:var(--color-primary);border-radius:999px}'],
})
export class ProgressBarComponent {
  @Input() value = 0;
  @Input() label = 'Progresso';
}
