import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/icon/icon.component';
import { LogoComponent } from '../../shared/logo/logo.component';

/** Somente visual. Login real será implementado pelo backend (Yan). */
@Component({
  selector: 'foco-login', standalone: true, imports: [FormsModule, RouterLink, IconComponent, LogoComponent],
  template: `<div class="wrap"><div class="card stack">
    <foco-logo /><h1>Entrar</h1><p class="muted">Organize seus estudos com foco.</p>
    <div class="field"><label for="email">E-mail</label><input id="email" type="email" autocomplete="email" [(ngModel)]="email" /></div>
    <div class="field"><label for="senha">Senha</label>
      <div class="pw"><input id="senha" [type]="show() ? 'text' : 'password'" autocomplete="current-password" [(ngModel)]="senha" />
        <button type="button" class="btn btn-ghost" (click)="show.set(!show())" [attr.aria-label]="show() ? 'Ocultar senha' : 'Mostrar senha'"><foco-icon name="eye" /></button></div></div>
    <button class="btn" type="button" routerLink="/dashboard">Entrar</button>
    <p class="muted">Ainda não tem conta? <a routerLink="/cadastro">Cadastre-se</a></p></div></div>`,
  styles: ['.wrap{min-height:100vh;display:grid;place-items:center;padding:1rem}.card{width:100%;max-width:400px}.pw{display:flex;gap:.25rem}.pw input{flex:1}'],
})
export class LoginComponent { email = ''; senha = ''; show = signal(false); }
