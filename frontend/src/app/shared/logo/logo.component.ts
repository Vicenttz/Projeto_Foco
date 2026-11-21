import { Component, Input } from '@angular/core';

<<<<<<< HEAD
/** Logo do FOCO em SVG: acompanha as cores escolhidas na aba Aparência (os PNGs em public/brand seguem no favicon). */
@Component({
  selector: 'foco-logo',
  standalone: true,
  template: `<svg [attr.height]="height" [attr.width]="height * (showText ? 3.1 : 1)" [attr.viewBox]="showText ? '0 0 124 40' : '0 0 40 40'" role="img" aria-label="FOCO">
    <defs><linearGradient id="lg-foco" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--color-primary)"/><stop offset="1" stop-color="var(--color-accent)"/></linearGradient></defs>
    <circle cx="20" cy="20" r="17" fill="none" stroke="url(#lg-foco)" stroke-width="3.2"/>
    <circle cx="20" cy="20" r="10" fill="none" stroke="url(#lg-foco)" stroke-width="3.2" opacity=".65"/>
    <circle cx="20" cy="20" r="4.2" fill="url(#lg-foco)"/>
    @if (showText) { <text x="46" y="28.5" font-family="var(--font-sans)" font-weight="700" font-size="25" letter-spacing="1.5" fill="url(#lg-foco)">FOCO</text> }
  </svg>`,
  styles: [':host{display:inline-flex;line-height:0}'],
})
export class LogoComponent {
  @Input() height = 36;
  @Input() showText = true;
=======
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
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
}
