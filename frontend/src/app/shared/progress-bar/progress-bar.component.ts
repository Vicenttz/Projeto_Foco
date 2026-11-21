import { Component, Input } from '@angular/core';

@Component({
  selector: 'foco-progress',
  standalone: true,
  template: `<div class="track" role="progressbar" [attr.aria-valuenow]="value" aria-valuemin="0" aria-valuemax="100" [attr.aria-label]="label">
<<<<<<< HEAD
    <div class="fill" [style.width.%]="value"></div></div><span class="muted pct">{{ value }}%</span>`,
  styles: [`:host{display:flex;align-items:center;gap:.6rem}
    .track{flex:1;height:9px;border-radius:999px;background:color-mix(in srgb,var(--color-primary) 14%,transparent);overflow:hidden}
    .fill{height:100%;background:var(--gradient);border-radius:999px;transition:width .9s cubic-bezier(.2,.8,.2,1);position:relative;overflow:hidden}
    .fill::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgb(255 255 255/.45),transparent);transform:translateX(-100%);animation:brilho 2.6s infinite}
    .pct{min-width:2.6rem;text-align:right;font-weight:600}
    @keyframes brilho{to{transform:translateX(100%)}}`],
=======
    <div class="fill" [style.width.%]="value"></div></div><span class="muted">{{ value }}%</span>`,
  styles: [':host{display:flex;align-items:center;gap:.6rem}.track{flex:1;height:8px;border-radius:999px;background:var(--color-border);overflow:hidden}.fill{height:100%;background:var(--color-primary);border-radius:999px}'],
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
})
export class ProgressBarComponent {
  @Input() value = 0;
  @Input() label = 'Progresso';
}
