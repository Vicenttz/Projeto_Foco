import { Component } from '@angular/core';

/** Logo FOCO: o primeiro "O" é o símbolo de foco (círculos concêntricos). */
@Component({
  selector: 'foco-logo',
  standalone: true,
  template: `<span class="logo" aria-label="FOCO">F<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
    <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/></svg>CO</span>`,
  styles: ['.logo{font-weight:300;font-size:1.75rem;letter-spacing:.12em;color:var(--color-primary);display:inline-flex;align-items:center}svg{margin:0 .05em}'],
})
export class LogoComponent {}
