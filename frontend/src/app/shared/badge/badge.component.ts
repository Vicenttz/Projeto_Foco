import { Component, Input } from '@angular/core';

export type BadgeTone = 'alta' | 'media' | 'baixa' | 'neutral';

/** Badge de prioridade/status. Cores complementares do Figma: vermelho, laranja, azul. */
@Component({
  selector: 'foco-badge',
  standalone: true,
  template: `<span class="badge" [class]="tone"><ng-content /></span>`,
  styles: [`.badge{font-size:var(--fs-small);font-weight:var(--fw-semibold);padding:.15rem .6rem;border-radius:999px;border:1px solid currentColor}
    .alta{color:var(--color-red)}.media{color:var(--color-orange)}.baixa{color:var(--color-blue)}.neutral{color:var(--color-text-muted)}`],
})
export class BadgeComponent { @Input() tone: BadgeTone = 'neutral'; }
