import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../../shared/logo/logo.component';

/** Somente visual. Cadastro real será implementado pelo backend (Yan). */
@Component({
  selector: 'foco-cadastro', standalone: true, imports: [FormsModule, RouterLink, LogoComponent],
  template: `<div class="wrap"><div class="card stack">
    <foco-logo /><h1>Criar conta</h1>
    <div class="field"><label for="nome">Nome</label><input id="nome" autocomplete="name" [(ngModel)]="nome" /></div>
    <div class="field"><label for="email">E-mail</label><input id="email" type="email" autocomplete="email" [(ngModel)]="email" /></div>
    <div class="field"><label for="senha">Senha</label><input id="senha" type="password" autocomplete="new-password" [(ngModel)]="senha" /></div>
    <div class="field"><label for="conf">Confirmar senha</label><input id="conf" type="password" autocomplete="new-password" [(ngModel)]="conf" /></div>
    <button class="btn" type="button" routerLink="/dashboard">Cadastrar</button>
    <p class="muted">Já tem conta? <a routerLink="/login">Entrar</a></p></div></div>`,
  styles: ['.wrap{min-height:100vh;display:grid;place-items:center;padding:1rem}.card{width:100%;max-width:400px}'],
})
export class CadastroComponent { nome = ''; email = ''; senha = ''; conf = ''; }
