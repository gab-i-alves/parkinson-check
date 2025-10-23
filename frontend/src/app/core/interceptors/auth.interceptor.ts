import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { UserService } from '../services/user.service';

/**
 * HTTP Interceptor que:
 * 1. Adiciona withCredentials: true em todas as requisições (para cookies HttpOnly)
 * 2. Trata erros 401 (não autenticado) redirecionando para login
 * 3. Trata erros 403 (sem permissão) exibindo mensagem e redirecionando
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(EnvironmentInjector);

  // Adiciona withCredentials para todas as requisições
  const reqWithCredentials = req.clone({
    withCredentials: true,
  });

  return next(reqWithCredentials).pipe(
    catchError((error: HttpErrorResponse) => {
      const publicRoutes = ['/auth/login', '/auth/register', '/auth/forget-password', '/auth/reset-password'];
      
      // Checar as rotas publicas antes de interceptar

      

      // Executa tratamento de erro dentro do contexto de injeção
      runInInjectionContext(injector, () => {
        const router = inject(Router);
        const userService = inject(UserService);

      // Se a URL atual deve ser publica, não redirecione.
      const isPublicRoute = publicRoutes.some(route => router.url.startsWith(route));

        if (error.status === 401) {
          // Token expirado ou inválido - limpar sessão e redirecionar
          userService.setCurrentUser(null);
          if (!isPublicRoute) {
            console.warn('Sessão expirada. Redirecionando para login...');
            router.navigate(['/auth/login']);
          }

        } else if (error.status === 403) {
          // Sem permissão - redirecionar para dashboard apropriado
          const currentUser = userService.getCurrentUser();
          console.warn(
            `Acesso negado (403). Redirecionando para dashboard...`
          );

          if (currentUser?.role === 'medico') {
            router.navigate(['/dashboard/doctor']);
          } else if (currentUser?.role === 'paciente') {
            router.navigate(['/dashboard']);
          } else {
            // Usuário sem role válido - deslogar
            userService.setCurrentUser(null);
            router.navigate(['/auth/login']);
          }
        }
      });

      return throwError(() => error);
    })
  );
};
