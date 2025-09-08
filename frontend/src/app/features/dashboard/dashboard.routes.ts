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
      {
        path: 'my-doctors',
        loadComponent: () =>
          import('./components/my-doctors/my-doctors.component').then(
            (c) => c.MyDoctorsComponent
          ),
      },
      {
        path: 'binding-requests',
        loadComponent: () =>
          import(
            './components/binding-requests/binding-requests.component'
          ).then((c) => c.BindingRequestsComponent),
      },
      {
        path: 'tests',
        loadChildren: () =>
          import('./components/test-method-selection/test.routes').then(
            (r) => r.TEST_ROUTES
          ),
      },
    ],
  },
];
