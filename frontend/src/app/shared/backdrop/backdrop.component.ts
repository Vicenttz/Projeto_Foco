import { Component } from '@angular/core';

/** Fundo decorativo fixo (bolhas, grade ou pontos + formas geométricas). O estilo é escolhido na aba Aparência. */
@Component({
  selector: 'foco-backdrop',
  standalone: true,
  template: `<div class="backdrop" aria-hidden="true">
    <i class="blob b1"></i><i class="blob b2"></i><i class="blob b3"></i>
    <svg class="forma f1" viewBox="0 0 80 80"><circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" stroke-width="3"/></svg>
    <svg class="forma f2" viewBox="0 0 80 80"><path d="M40 8l34 60H6z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>
    <svg class="forma f3" viewBox="0 0 80 80"><path d="M40 12v56M12 40h56" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
    <svg class="forma f4" viewBox="0 0 80 80"><rect x="14" y="14" width="52" height="52" rx="14" fill="none" stroke="currentColor" stroke-width="3" transform="rotate(18 40 40)"/></svg>
  </div>`,
})
export class BackdropComponent {}
