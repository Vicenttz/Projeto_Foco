import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/theme/theme.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { BriefingService } from '../../services/briefing.service';
import { BriefingComponent } from '../../shared/briefing/briefing.component';
import { LogoComponent } from '../../shared/logo/logo.component';

@Component({
  selector: 'foco-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, LogoComponent, BriefingComponent],
  template: `
  <div class="shell">
    @if (menuOpen()) { <div class="scrim" (click)="menuOpen.set(false)"></div> }
    <aside class="sidebar" [class.open]="menuOpen()" aria-label="Menu principal">
      <a routerLink="/dashboard" aria-label="FOCO - início"><foco-logo [height]="38" /></a>
      <nav>
        @for (item of nav; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="active" (click)="menuOpen.set(false)"><foco-icon [name]="item.icon" />{{ item.label }}</a>
        }
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
          <button class="btn btn-secondary btn-icon" type="button" (click)="briefing.abrir()" aria-label="Mensagem do dia do assistente" title="Mensagem do dia"><foco-icon name="sparkles" /></button>
          <a class="btn btn-secondary btn-icon" routerLink="/aparencia" aria-label="Personalizar aparência" title="Personalizar aparência"><foco-icon name="palette" /></a>
          <button class="btn btn-secondary btn-icon" type="button" (click)="theme.alternar()" [attr.aria-label]="theme.escuro() ? 'Ativar modo claro' : 'Ativar modo escuro'">
            <foco-icon [name]="theme.escuro() ? 'sun' : 'moon'" /></button>
        </div>
      </header>
      <main class="main-area"><foco-briefing /><router-outlet /></main>
    </div>
  </div>`,
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  briefing = inject(BriefingService);
  menuOpen = signal(false);
  constructor() { this.briefing.entrar(); } // mensagem do dia: aparece na primeira entrada de cada dia
  primeiroNome = computed(() => (this.auth.usuario()?.nome ?? 'Estudante').split(' ')[0]);
  inicial = computed(() => (this.auth.usuario()?.nome ?? '?').charAt(0).toUpperCase());
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
