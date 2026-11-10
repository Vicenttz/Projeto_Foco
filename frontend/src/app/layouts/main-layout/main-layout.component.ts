import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/theme/theme.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { LogoComponent } from '../../shared/logo/logo.component';

@Component({
  selector: 'foco-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, LogoComponent],
  template: `
  <div class="shell">
    <aside class="sidebar" [class.open]="menuOpen()" aria-label="Menu principal">
      <foco-logo />
      <nav>
        @for (item of nav; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="active" (click)="menuOpen.set(false)"><foco-icon [name]="item.icon" />{{ item.label }}</a>
        }
      </nav>
    </aside>
    <div class="main">
      <header>
        <button class="btn btn-secondary menu-btn" (click)="menuOpen.set(!menuOpen())" aria-label="Abrir menu"><foco-icon name="menu" /></button>
        <span class="muted">Olá, Estudante</span>
        <button class="btn btn-secondary" (click)="theme.toggle()" [attr.aria-label]="theme.theme() === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'">
          <foco-icon [name]="theme.theme() === 'light' ? 'moon' : 'sun'" /></button>
      </header>
      <main><router-outlet /></main>
    </div>
  </div>`,
  styles: [`
    .shell{display:grid;grid-template-columns:240px 1fr;min-height:100vh}
    .sidebar{background:var(--color-surface);border-right:1px solid var(--color-border);padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-5)}
    nav{display:flex;flex-direction:column;gap:var(--space-1)}
    nav a{display:flex;align-items:center;gap:var(--space-3);padding:.65rem .8rem;border-radius:var(--radius-md);color:var(--color-text);text-decoration:none;font-weight:var(--fw-medium)}
    nav a:hover{background:var(--color-border)} nav a.active{background:var(--color-primary);color:var(--color-on-primary)}
    header{display:flex;justify-content:space-between;align-items:center;padding:var(--space-3) var(--space-5);border-bottom:1px solid var(--color-border)}
    main{padding:var(--space-5);max-width:1100px}
    .menu-btn{display:none}
    @media (max-width:800px){
      .shell{grid-template-columns:1fr}
      .sidebar{position:fixed;inset:0 auto 0 0;width:240px;transform:translateX(-100%);transition:transform .2s;z-index:10}
      .sidebar.open{transform:none}.menu-btn{display:inline-flex}
    }`],
})
export class MainLayoutComponent {
  theme = inject(ThemeService);
  menuOpen = signal(false);
  nav = [
    { path: '/dashboard', label: 'Dashboard', icon: 'home' },
    { path: '/disciplinas', label: 'Disciplinas', icon: 'book' },
    { path: '/tarefas', label: 'Tarefas', icon: 'check' },
    { path: '/projetos', label: 'Projetos', icon: 'folder' },
    { path: '/trilhas', label: 'Trilhas', icon: 'route' },
    { path: '/calendario', label: 'Calendário', icon: 'calendar' },
    { path: '/foco', label: 'Foco', icon: 'focus' },
    { path: '/assistente', label: 'Assistente IA', icon: 'chat' },
  ];
}
