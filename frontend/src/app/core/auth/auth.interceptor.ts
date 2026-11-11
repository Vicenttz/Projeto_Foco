import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

/** Envia o token JWT nas chamadas à API e trata 401 (sessão expirada). */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  if (!req.url.startsWith(environment.apiUrl)) return next(req); // token só vai para a nossa API

  const token = auth.token;
  const comToken = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  const ehLogin = req.url.endsWith('/auth/login');

  return next(comToken).pipe(
    catchError((err: HttpErrorResponse) => {
      // 401 no login = senha errada (a tela mostra o erro). Nas demais rotas = sessão inválida.
      if (err.status === 401 && !ehLogin && token) auth.sessaoExpirada();
      return throwError(() => err);
    }),
  );
};
