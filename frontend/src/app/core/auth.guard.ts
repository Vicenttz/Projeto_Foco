import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';

/** Só deixa entrar quem está logado; senão, manda para /login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.logado() ? true : inject(Router).createUrlTree(['/login']);
};

/** Telas de login/cadastro: quem já está logado vai direto ao dashboard. */
export const visitanteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.logado() ? inject(Router).createUrlTree(['/dashboard']) : true;
};

/** Área administrativa: só papel "admin". */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.ehAdmin() ? true : inject(Router).createUrlTree(['/dashboard']);
};
