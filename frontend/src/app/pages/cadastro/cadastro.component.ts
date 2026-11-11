import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LogoComponent } from '../../shared/logo/logo.component';

/** Cadastro real: chama POST /auth/cadastro e já faz login. */
@Component({
  selector: 'foco-cadastro', standalone: true, imports: [FormsModule, RouterLink, LogoComponent],
  template: `<div class="wrap"><div class="card stack">
    <foco-logo /><h1>Criar conta</h1>
    <div class="field"><label for="nome">Nome</label><input id="nome" autocomplete="name" [(ngModel)]="nome" /></div>
    <div class="field"><label for="email">E-mail</label><input id="email" type="email" autocomplete="email" [(ngModel)]="email" /></div>
    <div class="field"><label for="senha">Senha</label><input id="senha" type="password" autocomplete="new-password" [(ngModel)]="senha" /></div>
    <div class="field"><label for="conf">Confirmar senha</label><input id="conf" type="password" autocomplete="new-password" [(ngModel)]="conf" /></div>
    @if (erro()) { <p class="muted" role="alert">{{ erro() }}</p> }
    <button class="btn" type="button" (click)="cadastrar()" [disabled]="carregando()">{{ carregando() ? 'Cadastrando...' : 'Cadastrar' }}</button>
    <p class="muted">Já tem conta? <a routerLink="/login">Entrar</a></p></div></div>`,
  styles: ['.wrap{min-height:100vh;display:grid;place-items:center;padding:1rem}.card{width:100%;max-width:400px}'],
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
