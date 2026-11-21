<<<<<<< HEAD
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
=======
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
import { ThemeService } from '../../core/theme/theme.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { LogoComponent } from '../../shared/logo/logo.component';

@Component({
  selector: 'foco-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, LogoComponent],
  template: `
  <div class="shell">
<<<<<<< HEAD
    @if (menuOpen()) { <div class="scrim" (click)="menuOpen.set(false)"></div> }
    <aside class="sidebar" [class.open]="menuOpen()" aria-label="Menu principal">
      <a routerLink="/dashboard" aria-label="FOCO - início"><foco-logo [height]="38" /></a>
=======
    <aside class="sidebar" [class.open]="menuOpen()" aria-label="Menu principal">
      <foco-logo />
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
      <nav>
        @for (item of nav; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="active" (click)="menuOpen.set(false)"><foco-icon [name]="item.icon" />{{ item.label }}</a>
        }
<<<<<<< HEAD
        <span class="nav-sep">Personalizar</span>
        <a routerLink="/aparencia" routerLinkActive="active" (click)="menuOpen.set(false)"><foco-icon name="palette" />Aparência</a>
        @if (auth.ehAdmin()) {
          <span class="nav-sep">Administração</span>
          <a routerLink="/admin" routerLinkActive="active" (click)="menuOpen.set(false)"><foco-icon name="shield" />Painel admin</a>
        }
      </nav>
      <div class="user-chip">
        <span class="avatar">{{ inicial() }}</span>
        <div class="info"><b>{{ auth.usuario()?.nome }}</b><small>{{ auth.ehAdmin() ? 'Administrador' : 'Estudante' }}</small></div>
        <button class="btn btn-ghost btn-icon" type="button" (click)="auth.logout()" aria-label="Sair" title="Sair"><foco-icon name="logout" [size]="18" /></button>
      </div>
    </aside>
    <div>
      <header class="topbar">
        <div class="row">
          <button class="btn btn-secondary btn-icon menu-btn" type="button" (click)="menuOpen.set(!menuOpen())" aria-label="Abrir menu"><foco-icon name="menu" /></button>
          <span>Olá, <b class="grad-text">{{ primeiroNome() }}</b> 👋</span>
        </div>
        <div class="row" style="gap:.5rem">
          <a class="btn btn-secondary btn-icon" routerLink="/aparencia" aria-label="Personalizar aparência" title="Personalizar aparência"><foco-icon name="palette" /></a>
          <button class="btn btn-secondary btn-icon" type="button" (click)="theme.alternar()" [attr.aria-label]="theme.escuro() ? 'Ativar modo claro' : 'Ativar modo escuro'">
            <foco-icon [name]="theme.escuro() ? 'sun' : 'moon'" /></button>
        </div>
      </header>
      <main class="main-area"><router-outlet /></main>
    </div>
  </div>`,
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  menuOpen = signal(false);
  primeiroNome = computed(() => (this.auth.usuario()?.nome ?? 'Estudante').split(' ')[0]);
  inicial = computed(() => (this.auth.usuario()?.nome ?? '?').charAt(0).toUpperCase());
=======
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
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
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
