import { Component, Input } from '@angular/core';

<<<<<<< HEAD
export type BadgeTone = 'alta' | 'media' | 'baixa' | 'neutral' | 'ok' | 'brand';

=======
export type BadgeTone = 'alta' | 'media' | 'baixa' | 'neutral';

/** Badge de prioridade/status. Cores complementares do Figma: vermelho, laranja, azul. */
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
@Component({
  selector: 'foco-badge',
  standalone: true,
  template: `<span class="badge" [class]="tone"><ng-content /></span>`,
<<<<<<< HEAD
  styles: [`.badge{font-size:var(--fs-small);font-weight:var(--fw-semibold);padding:.18rem .65rem;border-radius:999px;background:color-mix(in srgb,currentColor 12%,transparent);white-space:nowrap;text-transform:capitalize}
    .alta{color:var(--color-red)}.media{color:var(--color-orange)}.baixa{color:var(--color-blue)}.neutral{color:var(--color-text-muted)}
    .ok{color:var(--color-success)}.brand{color:var(--color-primary)}`],
=======
  styles: [`.badge{font-size:var(--fs-small);font-weight:var(--fw-semibold);padding:.15rem .6rem;border-radius:999px;border:1px solid currentColor}
    .alta{color:var(--color-red)}.media{color:var(--color-orange)}.baixa{color:var(--color-blue)}.neutral{color:var(--color-text-muted)}`],
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
})
export class BadgeComponent { @Input() tone: BadgeTone = 'neutral'; }
