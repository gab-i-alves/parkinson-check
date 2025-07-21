import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((r) => r.AUTH_ROUTES),
  },

  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },

  {
    path: '**',
    loadComponent: () =>
      import('./core/components/not-found/not-found.component').then(
        (c) => c.NotFoundComponent
      ),
  },
];
