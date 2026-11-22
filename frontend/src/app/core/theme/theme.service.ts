import { Injectable, signal } from '@angular/core';

export type Mode = 'auto' | 'light' | 'dark';
export type CardStyle = 'glass' | 'solid' | 'outline';
export type BgStyle = 'blobs' | 'grid' | 'dots' | 'plain';

export interface Palette { id: string; nome: string; primary: string; accent: string; }
export interface Aparencia {
  mode: Mode; palette: string; custom: string | null; card: CardStyle; bg: BgStyle;
  font: string; radius: number; animacoes: boolean; tema: string;
}
export interface Preset { id: string; nome: string; desc: string; cfg: Partial<Aparencia>; }

export const PALETAS: Palette[] = [
  { id: 'foco', nome: 'Roxo FOCO', primary: '#8746eb', accent: '#c15bf5' },
  { id: 'oceano', nome: 'Oceano', primary: '#0284c7', accent: '#14b8a6' },
  { id: 'floresta', nome: 'Floresta', primary: '#16a34a', accent: '#84cc16' },
  { id: 'sunset', nome: 'Pôr do sol', primary: '#f97316', accent: '#ec4899' },
  { id: 'rosa', nome: 'Rosa', primary: '#ec4899', accent: '#a855f7' },
  { id: 'neon', nome: 'Neon', primary: '#06b6d4', accent: '#a855f7' },
  { id: 'grafite', nome: 'Grafite', primary: '#475569', accent: '#0ea5e9' },
];
export const FONTES = [
  { id: 'inter', nome: 'Inter', css: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif" },
  { id: 'poppins', nome: 'Poppins', css: "'Poppins', system-ui, sans-serif" },
  { id: 'grotesk', nome: 'Space Grotesk', css: "'Space Grotesk', system-ui, sans-serif" },
  { id: 'lora', nome: 'Lora (serifada)', css: "'Lora', Georgia, serif" },
];
const BASE: Aparencia = { mode: 'auto', palette: 'foco', custom: null, card: 'glass', bg: 'blobs', font: 'inter', radius: 14, animacoes: true, tema: 'classico' };
export const PRESETS: Preset[] = [
  { id: 'classico', nome: 'FOCO Clássico', desc: 'Roxo, vidro e bolhas', cfg: { ...BASE } },
  { id: 'neon', nome: 'Neon Noturno', desc: 'Escuro, ciano e grade', cfg: { mode: 'dark', palette: 'neon', card: 'glass', bg: 'grid', font: 'grotesk', radius: 10 } },
  { id: 'oceano', nome: 'Oceano Zen', desc: 'Azul calmo e cantos suaves', cfg: { mode: 'light', palette: 'oceano', card: 'glass', bg: 'blobs', font: 'poppins', radius: 22 } },
  { id: 'sunset', nome: 'Pôr do Sol', desc: 'Laranja, rosa e pontinhos', cfg: { mode: 'light', palette: 'sunset', card: 'solid', bg: 'dots', font: 'poppins', radius: 18 } },
  { id: 'floresta', nome: 'Floresta', desc: 'Verde, contorno e serifa', cfg: { mode: 'light', palette: 'floresta', card: 'outline', bg: 'blobs', font: 'lora', radius: 12 } },
  { id: 'doce', nome: 'Doce Rosa', desc: 'Rosa, redondo e leve', cfg: { mode: 'light', palette: 'rosa', card: 'glass', bg: 'dots', font: 'poppins', radius: 26 } },
  { id: 'minimal', nome: 'Minimal', desc: 'Grafite, liso e reto', cfg: { mode: 'auto', palette: 'grafite', card: 'outline', bg: 'plain', font: 'inter', radius: 6 } },
];

const KEY = 'foco_aparencia';
const rgb = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const hex = (v: number[]) => '#' + v.map(n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('');
const mix = (a: string, b: string, t: number) => { const A = rgb(a), B = rgb(b); return hex(A.map((v, i) => v + (B[i] - v) * t)); };
const lum = (h: string) => { const [r, g, b] = rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
function girar(h: string, graus: number): string {
  const [r, g, b] = rgb(h).map(v => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  let hh = 0, s = 0;
  if (d) { s = d / (1 - Math.abs(2 * l - 1)); hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60; }
  hh = (hh + graus + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((hh / 60) % 2) - 1)), m = l - c / 2;
  const [r1, g1, b1] = hh < 60 ? [c, x, 0] : hh < 120 ? [x, c, 0] : hh < 180 ? [0, c, x] : hh < 240 ? [0, x, c] : hh < 300 ? [x, 0, c] : [c, 0, x];
  return hex([(r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255]);
}

/** Aparência do site: modo claro/escuro, paleta, cor própria, estilo dos cards, fundo, fonte, cantos e animações. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly cfg = signal<Aparencia>(this.carregar());
  readonly escuro = signal(false);
  private mq = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    this.mq.addEventListener('change', () => this.aplicar());
    this.aplicar();
  }

  atualizar(p: Partial<Aparencia>): void { this.cfg.update(c => ({ ...c, ...p })); this.aplicar(); }
  usarPreset(id: string): void {
    const pr = PRESETS.find(x => x.id === id); if (!pr) return;
    this.cfg.set({ ...BASE, ...pr.cfg, custom: null, tema: id }); this.aplicar();
  }
  resetar(): void { this.cfg.set({ ...BASE }); this.aplicar(); }
  /** Atalho do cabeçalho: alterna claro/escuro. */
  alternar(): void { this.atualizar({ mode: this.escuro() ? 'light' : 'dark' }); }

  private aplicar(): void {
    const c = this.cfg(), root = document.documentElement;
    const escuro = c.mode === 'dark' || (c.mode === 'auto' && this.mq.matches);
    this.escuro.set(escuro);
    const pal = PALETAS.find(p => p.id === c.palette) ?? PALETAS[0];
    let primary = c.custom ?? pal.primary, accent = c.custom ? girar(c.custom, 38) : pal.accent;
    if (escuro) { primary = mix(primary, '#ffffff', 0.22); accent = mix(accent, '#ffffff', 0.18); }
    const fonte = FONTES.find(f => f.id === c.font) ?? FONTES[0];
    root.setAttribute('data-theme', escuro ? 'dark' : 'light');
    root.setAttribute('data-card', c.card); root.setAttribute('data-bg', c.bg); root.setAttribute('data-anim', c.animacoes ? 'on' : 'off');
    const s = root.style;
    s.setProperty('--color-primary', primary); s.setProperty('--color-accent', accent);
    s.setProperty('--color-on-primary', lum(primary) > 0.55 ? '#17141f' : '#ffffff');
    s.setProperty('--radius-base', `${c.radius}px`); s.setProperty('--font-sans', fonte.css);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', primary);
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* sem armazenamento: ignora */ }
  }

  private carregar(): Aparencia {
    try { return { ...BASE, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; } catch { return { ...BASE }; }
  }
}
