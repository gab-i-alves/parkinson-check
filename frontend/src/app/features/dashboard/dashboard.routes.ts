import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';
import { authGuard } from '../../core/guards/auth.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard(['paciente', 'medico', 'admin'])],
    children: [
      // Patient routes
      {
        path: '',
        canActivate: [authGuard(['paciente'])],
        loadChildren: () =>
          import('./patient/patient.routes').then((r) => r.PATIENT_ROUTES),
      },
      // Doctor routes
      {
        path: 'doctor',
        canActivate: [authGuard(['medico'])],
        loadChildren: () =>
          import('./doctor/doctor.routes').then((r) => r.DOCTOR_ROUTES),
      },
      // Test routes (accessible by both)
      {
        path: 'tests',
        canActivate: [authGuard(['paciente', 'medico'])],
        loadChildren: () =>
          import('./tests.routes').then((r) => r.TEST_ROUTES),
      },
      // Shared routes
      {
        path: 'notifications',
        canActivate: [authGuard(['paciente', 'medico'])],
        loadComponent: () =>
          import(
            '../../shared/components/notification-center/notification-center.component'
          ).then((c) => c.NotificationCenterComponent),
      },
      {
        path: 'admin',
        canActivate: [authGuard(['admin'])],
        loadComponent: () =>
          import('./components/admin-dashboard/admin-dashboard.component').then(
            (c) => c.AdminDashboardComponent
          ),
      },
    ],
  },
];
