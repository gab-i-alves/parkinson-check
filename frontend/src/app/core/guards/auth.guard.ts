import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.services';
import { UserService } from '../services/user.service';
import { of, switchMap, map, catchError } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.currentUser()) {
    return true;
  }

  return authService.getCurrentUser().pipe(
    map((user) => {
      if (user) {
        return true;
      }
      return router.createUrlTree(['/auth/login']);
    }),
    catchError(() => {
      console.error(
        'Erro ao buscar usuário (cookie inválido ou ausente). Redirecionando para login.'
      );
      return of(router.createUrlTree(['/auth/login']));
    })
  );
};
