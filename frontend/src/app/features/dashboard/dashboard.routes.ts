import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';
import { authGuard } from '../../core/guards/auth.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './components/patient-dashboard/patient-dashboard.component'
          ).then((c) => c.PatientDashboardComponent),
      },
      {
        path: 'doctor',
        loadComponent: () =>
          import(
            './components/doctor-dashboard/doctor-dashboard.component'
          ).then((c) => c.DoctorDashboardComponent),
      },
    ],
  },
];
