import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { ApiService } from '../http/api.service';
import { User } from '../../models';

interface LoginResponse { token: string; usuario: User; }

const TOKEN_KEY = 'foco_token';
const USER_KEY = 'foco_user';

/** Autenticação: login, cadastro, logout e token JWT (guardado no localStorage). */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private tokenSig = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private userSig = signal<User | null>(this.lerUsuario());

  readonly usuario = this.userSig.asReadonly();
  readonly logado = computed(() => this.tokenSig() !== null);

  get token(): string | null { return this.tokenSig(); }

  login(email: string, senha: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', { email, senha }).pipe(
      tap(res => this.salvarSessao(res.token, res.usuario)),
    );
  }

  /** Cria a conta e já entra com ela. */
  cadastrar(nome: string, email: string, senha: string): Observable<LoginResponse> {
    return this.api.post<User>('/auth/cadastro', { nome, email, senha }).pipe(
      switchMap(() => this.login(email, senha)),
    );
  }

  logout(): void {
    this.limparSessao();
    this.router.navigate(['/login']);
  }

  /** Usado pelo interceptor quando a API responde 401 (token expirado ou inválido). */
  sessaoExpirada(): void { this.logout(); }

  private salvarSessao(token: string, usuario: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
    this.tokenSig.set(token);
    this.userSig.set(usuario);
  }

  private limparSessao(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenSig.set(null);
    this.userSig.set(null);
  }

  private lerUsuario(): User | null {
    try { return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'); } catch { return null; }
  }
}
