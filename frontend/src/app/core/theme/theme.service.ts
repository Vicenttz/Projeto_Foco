import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = signal<'light' | 'dark'>(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  constructor() { this.apply(); }
  toggle() { this.theme.update(t => (t === 'light' ? 'dark' : 'light')); this.apply(); }
  private apply() { document.documentElement.setAttribute('data-theme', this.theme()); }
}
