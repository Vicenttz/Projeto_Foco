import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BgStyle, CardStyle, FONTES, Mode, PALETAS, PRESETS, ThemeService } from '../../core/theme/theme.service';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';

/** Aba de personalização: temas prontos, modo claro/escuro, paleta, cor própria, cards, fundo, fonte, cantos e animações. */
@Component({
  selector: 'foco-aparencia', standalone: true, imports: [FormsModule, IconComponent, BadgeComponent, ProgressBarComponent],
  template: `<div class="stack">
    <div class="row-between"><div><h1>Aparência</h1><p class="muted">Tudo muda na hora e fica salvo neste navegador.</p></div>
      <button class="btn btn-secondary" type="button" (click)="t.resetar()"><foco-icon name="reset" [size]="18" />Restaurar padrão</button></div>

    <section class="stack"><h2>Temas prontos</h2>
      <div class="grid">@for (p of presets; track p.id) {
        <button class="card preset" type="button" [class.on]="c().tema === p.id" (click)="t.usarPreset(p.id)">
          <div class="faixa" [style.background]="faixa(p.cfg.palette)"></div><h3>{{ p.nome }}</h3><p class="muted">{{ p.desc }}</p></button> }</div></section>

    <div class="grid-2">
      <section class="card stack"><h3>Modo</h3>
        <div class="row">@for (m of modos; track m.id) { <button class="chip" type="button" [class.on]="c().mode === m.id" (click)="t.atualizar({ mode: m.id })">{{ m.nome }}</button> }</div>
        <h3>Cor principal</h3>
        <div class="row">@for (p of paletas; track p.id) {
          <button class="swatch" type="button" [class.on]="!c().custom && c().palette === p.id" [style.background]="'linear-gradient(135deg,' + p.primary + ',' + p.accent + ')'"
            [attr.aria-label]="p.nome" [title]="p.nome" (click)="t.atualizar({ palette: p.id, custom: null })"></button> }</div>
        <div class="field"><label for="cor">Cor personalizada</label>
          <div class="row" style="flex-wrap:nowrap"><input id="cor" type="color" [ngModel]="c().custom ?? corAtual()" (ngModelChange)="t.atualizar({ custom: $event })" />
            @if (c().custom) { <button class="btn btn-ghost btn-sm" type="button" (click)="t.atualizar({ custom: null })">Remover</button> }</div></div>
      </section>

      <section class="card stack"><h3>Estilo dos cards</h3>
        <div class="row">@for (s of estilos; track s.id) { <button class="chip" type="button" [class.on]="c().card === s.id" (click)="t.atualizar({ card: s.id })">{{ s.nome }}</button> }</div>
        <h3>Fundo decorativo</h3>
        <div class="row">@for (b of fundos; track b.id) { <button class="chip" type="button" [class.on]="c().bg === b.id" (click)="t.atualizar({ bg: b.id })">{{ b.nome }}</button> }</div>
        <h3>Fonte</h3>
        <div class="row">@for (f of fontes; track f.id) { <button class="chip" type="button" [class.on]="c().font === f.id" [style.font-family]="f.css" (click)="t.atualizar({ font: f.id })">{{ f.nome }}</button> }</div>
      </section>

      <section class="card stack"><h3>Cantos arredondados: {{ c().radius }}px</h3>
        <input type="range" min="2" max="32" [ngModel]="c().radius" (ngModelChange)="t.atualizar({ radius: +$event })" aria-label="Arredondamento dos cantos" />
        <label class="row" style="cursor:pointer"><input type="checkbox" [ngModel]="c().animacoes" (ngModelChange)="t.atualizar({ animacoes: $event })" /> Animações e efeitos</label>
        <p class="muted">Desligue as animações se preferir uma tela mais calma.</p></section>

      <section class="card stack"><h3>Pré-visualização</h3>
        <div class="row"><button class="btn" type="button">Botão principal</button><button class="btn btn-secondary" type="button">Secundário</button></div>
        <div class="row"><foco-badge tone="alta">alta</foco-badge><foco-badge tone="media">média</foco-badge><foco-badge tone="baixa">baixa</foco-badge><foco-badge tone="brand">marca</foco-badge></div>
        <foco-progress [value]="68" label="Exemplo de progresso" /></section>
    </div></div>`,
})
export class AparenciaComponent {
  t = inject(ThemeService);
  c = this.t.cfg;
  presets = PRESETS; paletas = PALETAS; fontes = FONTES;
  modos: { id: Mode; nome: string }[] = [{ id: 'auto', nome: 'Automático' }, { id: 'light', nome: '☀️ Claro' }, { id: 'dark', nome: '🌙 Escuro' }];
  estilos: { id: CardStyle; nome: string }[] = [{ id: 'glass', nome: 'Vidro' }, { id: 'solid', nome: 'Sólido' }, { id: 'outline', nome: 'Contorno' }];
  fundos: { id: BgStyle; nome: string }[] = [{ id: 'blobs', nome: 'Bolhas' }, { id: 'grid', nome: 'Grade' }, { id: 'dots', nome: 'Pontos' }, { id: 'plain', nome: 'Liso' }];
  faixa(id?: string) { const p = PALETAS.find(x => x.id === (id ?? 'foco')) ?? PALETAS[0]; return `linear-gradient(135deg,${p.primary},${p.accent})`; }
  corAtual() { return (PALETAS.find(p => p.id === this.c().palette) ?? PALETAS[0]).primary; }
}
