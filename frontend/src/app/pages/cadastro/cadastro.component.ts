import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ArtComponent } from '../../shared/art/art.component';
import { LogoComponent } from '../../shared/logo/logo.component';

@Component({
  selector: 'foco-cadastro', standalone: true, imports: [FormsModule, RouterLink, LogoComponent, ArtComponent],
  template: `<div class="auth">
    <section class="auth-art"><foco-logo [height]="44" />
      <div><h1>Comece agora.<br>É rápido.</h1><p class="muted" style="margin-top:.7rem">Crie sua conta e monte sua rotina de estudos.</p></div>
      <foco-art tipo="hero" /></section>
    <section class="auth-form"><div class="card stack auth-card">
      <h1>Criar conta</h1>
      <div class="field"><label for="nome">Nome</label><input id="nome" autocomplete="name" [(ngModel)]="nome" /></div>
      <div class="field"><label for="email">E-mail</label><input id="email" type="email" autocomplete="email" [(ngModel)]="email" /></div>
      <div class="field"><label for="senha">Senha (mínimo 8 caracteres)</label><input id="senha" type="password" autocomplete="new-password" [(ngModel)]="senha" /></div>
      <div class="field"><label for="conf">Confirmar senha</label><input id="conf" type="password" autocomplete="new-password" [(ngModel)]="conf" (keyup.enter)="cadastrar()" /></div>
      @if (erro()) { <p class="erro" role="alert">{{ erro() }}</p> }
      <button class="btn" type="button" (click)="cadastrar()" [disabled]="carregando()">{{ carregando() ? 'Cadastrando...' : 'Cadastrar' }}</button>
      <p class="muted">Já tem conta? <a routerLink="/login">Entrar</a></p></div></section></div>`,
})
export class CadastroComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  nome = ''; email = ''; senha = ''; conf = '';
  erro = signal(''); carregando = signal(false);

  cadastrar() {
    if (!this.nome.trim() || !this.email || !this.senha) { this.erro.set('Preencha nome, e-mail e senha.'); return; }
    if (this.senha.length < 8) { this.erro.set('A senha deve ter pelo menos 8 caracteres.'); return; }
    if (this.senha !== this.conf) { this.erro.set('As senhas não conferem.'); return; }
    this.erro.set(''); this.carregando.set(true);
    this.auth.cadastrar(this.nome.trim(), this.email.trim(), this.senha).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e: HttpErrorResponse) => {
        this.carregando.set(false);
        this.erro.set(e.status === 0 ? 'Não foi possível conectar ao servidor.' : (typeof e.error?.detail === 'string' ? e.error.detail : 'Erro ao cadastrar.'));
      },
    });
  }
}
