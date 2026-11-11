import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { LogoComponent } from '../../shared/logo/logo.component';

/** Login real: chama POST /auth/login e guarda o token. */
@Component({
  selector: 'foco-login', standalone: true, imports: [FormsModule, RouterLink, IconComponent, LogoComponent],
  template: `<div class="wrap"><div class="card stack">
    <foco-logo /><h1>Entrar</h1><p class="muted">Organize seus estudos com foco.</p>
    <div class="field"><label for="email">E-mail</label><input id="email" type="email" autocomplete="email" [(ngModel)]="email" /></div>
    <div class="field"><label for="senha">Senha</label>
      <div class="pw"><input id="senha" [type]="show() ? 'text' : 'password'" autocomplete="current-password" [(ngModel)]="senha" />
        <button type="button" class="btn btn-ghost" (click)="show.set(!show())" [attr.aria-label]="show() ? 'Ocultar senha' : 'Mostrar senha'"><foco-icon name="eye" /></button></div></div>
    @if (erro()) { <p class="muted" role="alert">{{ erro() }}</p> }
    <button class="btn" type="button" (click)="entrar()" [disabled]="carregando()">{{ carregando() ? 'Entrando...' : 'Entrar' }}</button>
    <p class="muted">Ainda não tem conta? <a routerLink="/cadastro">Cadastre-se</a></p></div></div>`,
  styles: ['.wrap{min-height:100vh;display:grid;place-items:center;padding:1rem}.card{width:100%;max-width:400px}.pw{display:flex;gap:.25rem}.pw input{flex:1}'],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = ''; senha = ''; show = signal(false);
  erro = signal(''); carregando = signal(false);

  entrar() {
    if (!this.email || !this.senha) { this.erro.set('Informe e-mail e senha.'); return; }
    this.erro.set(''); this.carregando.set(true);
    this.auth.login(this.email.trim(), this.senha).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e: HttpErrorResponse) => {
        this.carregando.set(false);
        this.erro.set(e.status === 0 ? 'Não foi possível conectar ao servidor.' : (typeof e.error?.detail === 'string' ? e.error.detail : 'Erro ao entrar.'));
      },
    });
  }
}
