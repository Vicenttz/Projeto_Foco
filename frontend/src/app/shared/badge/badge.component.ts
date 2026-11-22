import { Component, Input } from '@angular/core';

export type BadgeTone = 'alta' | 'media' | 'baixa' | 'neutral' | 'ok' | 'brand';

@Component({
  selector: 'foco-badge',
  standalone: true,
  template: `<span class="badge" [class]="tone"><ng-content /></span>`,
  styles: [`.badge{font-size:var(--fs-small);font-weight:var(--fw-semibold);padding:.18rem .65rem;border-radius:999px;background:color-mix(in srgb,currentColor 12%,transparent);white-space:nowrap;text-transform:capitalize}
    .alta{color:var(--color-red)}.media{color:var(--color-orange)}.baixa{color:var(--color-blue)}.neutral{color:var(--color-text-muted)}
    .ok{color:var(--color-success)}.brand{color:var(--color-primary)}`],
})
export class BadgeComponent { @Input() tone: BadgeTone = 'neutral'; }
