import { Component, Input } from '@angular/core';

/** Ilustrações em SVG que acompanham a paleta escolhida (usam as variáveis de cor do tema). */
@Component({
  selector: 'foco-art',
  standalone: true,
  template: `
  @if (tipo === 'hero') {
    <svg viewBox="0 0 400 360" class="art" role="img" aria-label="Ilustração: alvo de foco com tarefas ao redor">
      <defs>
        <linearGradient id="ah-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--color-primary)"/><stop offset="1" stop-color="var(--color-accent)"/></linearGradient>
        <radialGradient id="ah-r"><stop offset="0" stop-color="var(--color-primary)" stop-opacity=".28"/><stop offset="1" stop-color="var(--color-primary)" stop-opacity="0"/></radialGradient>
      </defs>
      <circle cx="200" cy="180" r="170" fill="url(#ah-r)"/>
      <g class="orbita"><circle cx="200" cy="180" r="140" fill="none" stroke="url(#ah-g)" stroke-width="1.6" stroke-dasharray="3 9" opacity=".7"/>
        <circle cx="340" cy="180" r="9" fill="url(#ah-g)"/><circle cx="60" cy="180" r="5" fill="var(--color-accent)"/></g>
      <circle cx="200" cy="180" r="105" fill="none" stroke="url(#ah-g)" stroke-width="10" opacity=".25"/>
      <circle cx="200" cy="180" r="72" fill="none" stroke="url(#ah-g)" stroke-width="10" opacity=".55"/>
      <circle cx="200" cy="180" r="38" fill="url(#ah-g)"/>
      <path d="M184 181l12 12 22-26" fill="none" stroke="var(--color-on-primary)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <g class="flutua"><rect x="18" y="62" width="128" height="52" rx="14" fill="var(--color-surface-solid)" stroke="var(--color-border)"/>
        <circle cx="42" cy="88" r="11" fill="url(#ah-g)"/><path d="M37 88l4 4 7-8" fill="none" stroke="var(--color-on-primary)" stroke-width="2.6" stroke-linecap="round"/>
        <rect x="62" y="79" width="66" height="7" rx="3.5" fill="var(--color-text)" opacity=".75"/><rect x="62" y="93" width="44" height="6" rx="3" fill="var(--color-text-muted)" opacity=".5"/></g>
      <g class="flutua2"><rect x="256" y="236" width="128" height="52" rx="14" fill="var(--color-surface-solid)" stroke="var(--color-border)"/>
        <rect x="274" y="252" width="22" height="22" rx="7" fill="none" stroke="var(--color-primary)" stroke-width="2.6"/>
        <rect x="306" y="253" width="62" height="7" rx="3.5" fill="var(--color-text)" opacity=".75"/><rect x="306" y="267" width="40" height="6" rx="3" fill="var(--color-text-muted)" opacity=".5"/></g>
      <g class="pisca" fill="var(--color-accent)"><path d="M350 70l5 13 13 5-13 5-5 13-5-13-13-5 13-5z"/><path d="M52 262l3.5 9 9 3.5-9 3.5-3.5 9-3.5-9-9-3.5 9-3.5z" opacity=".7"/></g>
    </svg>
  } @else {
    <svg viewBox="0 0 160 120" class="art vazio" role="img" aria-label="Nada por aqui ainda">
      <defs><linearGradient id="av-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--color-primary)"/><stop offset="1" stop-color="var(--color-accent)"/></linearGradient></defs>
      <ellipse cx="80" cy="104" rx="46" ry="7" fill="var(--color-primary)" opacity=".13"/>
      <g class="flutua"><rect x="36" y="22" width="88" height="66" rx="14" fill="var(--color-surface-solid)" stroke="url(#av-g)" stroke-width="2.5"/>
        <rect x="50" y="38" width="42" height="7" rx="3.5" fill="url(#av-g)"/><rect x="50" y="52" width="60" height="6" rx="3" fill="var(--color-text-muted)" opacity=".4"/>
        <rect x="50" y="64" width="34" height="6" rx="3" fill="var(--color-text-muted)" opacity=".3"/></g>
      <g class="pisca" fill="var(--color-accent)"><path d="M132 18l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/></g>
    </svg>
  }`,
  styles: [`:host{display:block}.art{width:100%;height:auto;display:block}.vazio{max-width:170px}
    .orbita{transform-origin:200px 180px;animation:gira 26s linear infinite}
    .flutua{animation:flutua 5s ease-in-out infinite}.flutua2{animation:flutua 6s ease-in-out -2s infinite}
    .pisca{animation:pisca 3s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
    @keyframes gira{to{transform:rotate(360deg)}}@keyframes flutua{50%{transform:translateY(-9px)}}@keyframes pisca{50%{opacity:.3;transform:scale(.8)}}`],
})
export class ArtComponent { @Input() tipo: 'hero' | 'vazio' = 'hero'; }
