import { Component, Input } from '@angular/core';

/**
 * Logo oficial do FOCO (arquivos em public/brand).
 * - Tema claro: foco-logo.png. Tema escuro: foco-logo-dark.png (letras claras). A troca é automática.
 * - [height] é a altura VISÍVEL da logo em px (a margem transparente do PNG é descartada).
 * - [showText]="false" mostra só o símbolo (os círculos).
 * Usada na barra lateral, no login e no cadastro.
 */

// Área visível (em pixels do arquivo original), sem a margem transparente.
const LOGO = { w: 275, h: 107, x: 10, y: 20, vw: 255, vh: 67 };      // foco-logo*.png
const SIMBOLO = { w: 256, h: 256, x: 42, y: 42, vw: 172, vh: 172 };  // foco-symbol.png

@Component({
  selector: 'foco-logo',
  standalone: true,
  template: `
    <span class="box" role="img" aria-label="FOCO" [style.width.px]="g().vw * g().s" [style.height.px]="height">
      @if (showText) {
        <img class="light" src="brand/foco-logo.png" alt="" [style]="estilo()" />
        <img class="dark" src="brand/foco-logo-dark.png" alt="" [style]="estilo()" />
      } @else {
        <img src="brand/foco-symbol.png" alt="" [style]="estilo()" />
      }
    </span>`,
  styles: [`
    :host { display: inline-flex; line-height: 0; }
    .box { position: relative; display: block; overflow: hidden; flex: none; }
    img { position: absolute; max-width: none; display: block; }
    .dark { display: none; }
    :host-context(:root[data-theme='dark']) .light { display: none; }
    :host-context(:root[data-theme='dark']) .dark { display: block; }
  `],
})
export class LogoComponent {
  @Input() height = 38;
  @Input() showText = true;

  g() {
    const a = this.showText ? LOGO : SIMBOLO;
    return { ...a, s: this.height / a.vh };
  }
  estilo() {
    const g = this.g();
    return `width:${g.w * g.s}px;height:${g.h * g.s}px;left:${-g.x * g.s}px;top:${-g.y * g.s}px`;
  }
}
