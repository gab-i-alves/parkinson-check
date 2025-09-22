import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { UserRole } from '../models/user.model';

export function authGuard(expectedRoles: UserRole[]): CanActivateFn {
  return () => {
    const userService = inject(UserService);
    const router = inject(Router);
    const currentUser = userService.getCurrentUser();

    if (!currentUser) {
      router.navigate(['/auth/login']);
      return false;
    }
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
      } else {
        router.navigate(['/dashboard']);
      }
      return false;
    }
  };
}
