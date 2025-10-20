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
        path: 'patient-requests',
        loadComponent: () =>
          import(
            './components/patient-binding-requests/patient-binding-requests.component'
          ).then((c) => c.PatientBindingRequestsComponent),
      },
      {
        path: 'binding-requests',
        loadComponent: () =>
          import(
            './components/binding-requests/binding-requests.component'
          ).then((c) => c.BindingRequestsComponent),
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./components/my-patients/my-patients-list.component').then(
            (c) => c.MyPatientsListComponent
          ),
      },
      {
        path: 'tests',
        loadChildren: () =>
          import('./components/test-method-selection/test.routes').then(
            (r) => r.TEST_ROUTES
          ),
      },
      {
        path: 'clinical-test/patient-selection',
        loadComponent: () =>
          import(
            './components/patient-selector/patient-selector.component'
          ).then((c) => c.PatientSelectorComponent),
      },
      {
        path: 'clinical-test/type-selection/:patientId',
        loadComponent: () =>
          import(
            './components/clinical-test-type-selection/clinical-test-type-selection.component'
          ).then((c) => c.ClinicalTestTypeSelectionComponent),
      },
      {
        path: 'clinical-test/spiral/:patientId',
        loadComponent: () =>
          import('./components/spiral-test-webcam/spiral-test-webcam').then(
            (c) => c.SpiralTestWebcam
          ),
      },
      {
        path: 'clinical-test/voice/:patientId',
        loadComponent: () =>
          import('./components/voice-test/voice-test').then(
            (c) => c.VoiceTest
          ),
      },
    ],
  },
];
