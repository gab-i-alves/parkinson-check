import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LandingPage } from './features/home/landing-page/landing-page';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
    title: 'ParkinsonCheck | Acompanhamento Inteligente de Parkinson',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((r) => r.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then(
        (r) => r.DASHBOARD_ROUTES
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./core/components/not-found/not-found.component').then(
        (c) => c.NotFoundComponent
      ),
  },
];
