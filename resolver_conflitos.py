#!/usr/bin/env python3
"""Resolve os conflitos de merge do projeto FOCO ficando com o lado HEAD (o mais completo).

Uso (na raiz do projeto, a pasta que tem iniciar.py):   python resolver_conflitos.py
- Em cada bloco  <<<<<<< HEAD ... ======= ... >>>>>>>  mantém só o que está entre <<<<<<< HEAD e =======.
- Troca frontend/src/app/shared/logo/logo.component.ts pela versão com a LOGO OFICIAL (PNG em public/brand).
- Não mexe em node_modules, venv nem backend/static.
"""
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
PULAR = {"node_modules", "venv", ".git", "static", "__pycache__"}
EXT = {".py", ".ts", ".css", ".html", ".json", ".md", ".txt", ".bat", ".sh", ".example", ".gitignore", ""}

LOGO = '''import { Component, Input } from '@angular/core';

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
'''


def resolver(texto: str) -> tuple[str, int]:
    saida, estado, blocos = [], "normal", 0
    for linha in texto.splitlines(keepends=True):
        if linha.startswith("<<<<<<< "):
            estado, blocos = "head", blocos + 1
        elif linha.startswith("=======") and estado == "head":
            estado = "incoming"
        elif linha.startswith(">>>>>>> ") and estado == "incoming":
            estado = "normal"
        elif estado in ("normal", "head"):
            saida.append(linha)
    if estado != "normal":
        raise ValueError("bloco de conflito não terminou")
    return "".join(saida), blocos


def main() -> None:
    if not (RAIZ / "iniciar.py").exists():
        sys.exit("Rode este script na raiz do projeto (a pasta que contém iniciar.py).")
    total = 0
    for p in sorted(RAIZ.rglob("*")):
        if not p.is_file() or PULAR & set(p.relative_to(RAIZ).parts) or p.suffix not in EXT:
            continue
        try:
            txt = p.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        if "<<<<<<< " not in txt:
            continue
        novo, n = resolver(txt)
        if n:
            p.write_text(novo, encoding="utf-8", newline="")
            total += n
            print(f"  resolvido ({n} bloco(s)): {p.relative_to(RAIZ)}")
    logo = RAIZ / "frontend/src/app/shared/logo/logo.component.ts"
    logo.parent.mkdir(parents=True, exist_ok=True)
    logo.write_text(LOGO, encoding="utf-8", newline="\n")
    print(f"  logo oficial aplicada: {logo.relative_to(RAIZ)}")
    print(f"\nPronto: {total} bloco(s) de conflito resolvido(s).")


if __name__ == "__main__":
    main()
