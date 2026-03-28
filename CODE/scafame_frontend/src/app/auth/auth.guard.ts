import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1) Debe existir token
  const token = auth.getToken();
  if (!token) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // 2) No debe estar expirado
  if (auth.isTokenExpired()) {
    // Limpia storage pero sin navegar aquí (el guard devolverá la UrlTree)
    auth.logout(false);
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  return true;
};
