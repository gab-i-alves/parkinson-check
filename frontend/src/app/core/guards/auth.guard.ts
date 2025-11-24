import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { AuthService } from '../../features/auth/services/auth.services';
import { UserRole } from '../models/user.model';

export function authGuard(expectedRoles: UserRole[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const userService = inject(UserService);
    const router = inject(Router);
    const currentUser = userService.getCurrentUser();

    // If user already loaded, check immediately (synchronous path)
    if (currentUser !== null) {
      if (expectedRoles.includes(currentUser.role)) {
        return true;
      } else {
        console.warn(
          `Acesso negado. Usuário com papel '${
            currentUser.role
          }' tentou acessar uma rota para '${expectedRoles.join(', ')}'.`
        );

        if (currentUser.role === 'medico') {
          router.navigate(['/dashboard/doctor']);
        } else if (currentUser.role === 'admin') {
          router.navigate(['/dashboard/admin']);
        } else {
          router.navigate(['/dashboard']);
        }
        return false;
      }
    }

    // Otherwise, wait for auth status to be verified (asynchronous path)
    return authService.currentUser$.pipe(
      take(1),
      map((user) => {
        if (!user) {
          router.navigate(['/auth/login']);
          return false;
        }
        if (expectedRoles.includes(user.role)) {
          return true;
        } else {
          console.warn(
            `Acesso negado. Usuário com papel '${
              user.role
            }' tentou acessar uma rota para '${expectedRoles.join(', ')}'.`
          );

          if (user.role === 'medico') {
            router.navigate(['/dashboard/doctor']);
          } else if (user.role === 'admin') {
            router.navigate(['/dashboard/admin']);
          } else {
            router.navigate(['/dashboard']);
          }
          return false;
        }
      })
    );
  };
}
