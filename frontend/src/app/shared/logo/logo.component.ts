import { Component, Input } from '@angular/core';

/**
 * Logo oficial do FOCO (arquivos em public/brand).
 * Troca automaticamente para a versão clara das letras no tema escuro.
 * Use [height] para ajustar o tamanho (padrão 40px).
 */
@Component({
  selector: 'foco-logo',
  standalone: true,
  template: `
    <img class="light" src="brand/foco-logo.png" alt="FOCO" [style.height.px]="height" />
    <img class="dark" src="brand/foco-logo-dark.png" alt="FOCO" [style.height.px]="height" />`,
  styles: [`
    :host { display: inline-flex; line-height: 0; }
    img { width: auto; display: block; }
    .dark { display: none; }
    :host-context(:root[data-theme='dark']) .light { display: none; }
    :host-context(:root[data-theme='dark']) .dark { display: block; }
  `],
})
export class LogoComponent {
  @Input() height = 40;
}
