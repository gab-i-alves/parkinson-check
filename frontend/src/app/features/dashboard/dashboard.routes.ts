import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';
import { authGuard } from '../../core/guards/auth.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard(['paciente', 'medico'])],
    children: [
      {
        path: '',
        canActivate: [authGuard(['paciente'])],
        loadComponent: () =>
          import(
            './components/patient-dashboard/patient-dashboard.component'
          ).then((c) => c.PatientDashboardComponent),
      },
      {
        path: 'doctor',
        canActivate: [authGuard(['medico'])],
        loadComponent: () =>
          import(
            './components/doctor-dashboard/doctor-dashboard.component'
          ).then((c) => c.DoctorDashboardComponent),
      },
      {
        path: 'my-doctors',
        canActivate: [authGuard(['paciente'])],
        loadComponent: () =>
          import('./components/my-doctors/my-doctors.component').then(
            (c) => c.MyDoctorsComponent
          ),
      },
      {
        path: 'results',
        canActivate: [authGuard(['paciente'])],
        loadComponent: () =>
          import('./components/patient-results/patient-results.component').then(
            (c) => c.PatientResultsComponent
          ),
      },
      {
        path: 'patient-requests',
        canActivate: [authGuard(['paciente'])],
        loadComponent: () =>
          import(
            './components/patient-binding-requests/patient-binding-requests.component'
          ).then((c) => c.PatientBindingRequestsComponent),
      },
      {
        path: 'notifications',
        canActivate: [authGuard(['paciente', 'medico'])],
        loadComponent: () =>
          import(
            '../../shared/components/notification-center/notification-center.component'
          ).then((c) => c.NotificationCenterComponent),
      },
      {
        path: 'binding-requests',
        canActivate: [authGuard(['medico'])],
        loadComponent: () =>
          import(
            './components/binding-requests/binding-requests.component'
          ).then((c) => c.BindingRequestsComponent),
      },
      {
        path: 'patients',
        canActivate: [authGuard(['medico'])],
        loadComponent: () =>
          import('./components/my-patients/my-patients-list.component').then(
            (c) => c.MyPatientsListComponent
          ),
      },
      {
        path: 'tests',
        canActivate: [authGuard(['paciente'])],
        loadChildren: () =>
          import('./tests.routes').then(
            (r) => r.TEST_ROUTES
          ),
      },
      {
        path: 'clinical-test/patient-selection',
        canActivate: [authGuard(['medico'])],
        loadComponent: () =>
          import(
            './components/patient-selector/patient-selector.component'
          ).then((c) => c.PatientSelectorComponent),
      },
      {
        path: 'clinical-test/type-selection/:patientId',
        canActivate: [authGuard(['medico'])],
        loadComponent: () =>
          import(
            './components/clinical-test-type-selection/clinical-test-type-selection.component'
          ).then((c) => c.ClinicalTestTypeSelectionComponent),
      },
      {
        path: 'clinical-test/spiral/:patientId',
        canActivate: [authGuard(['medico'])],
        loadComponent: () =>
          import('./components/spiral-test-webcam/spiral-test-webcam.component').then(
            (c) => c.SpiralTestWebcamComponent
          ),
      },
      {
        path: 'clinical-test/voice/:patientId',
        canActivate: [authGuard(['medico'])],
        loadComponent: () =>
          import('./components/voice-test/voice-test.component').then(
            (c) => c.VoiceTestComponent
          ),
      },
      {
        path: 'clinical-test/result',
        canActivate: [authGuard(['medico'])],
        loadComponent: () =>
          import(
            './components/clinical-test-result/clinical-test-result.component'
          ).then((c) => c.ClinicalTestResultComponent),
      },
      {
        path: 'patient/:id',
        canActivate: [authGuard(['medico'])],
        loadComponent: () =>
          import('./components/patient-detail/patient-detail.component').then(
            (c) => c.PatientDetailComponent
          ),
      },
      {
        path: 'test/:testId',
        canActivate: [authGuard(['medico'])],
        loadComponent: () =>
          import('./components/test-detail/test-detail.component').then(
            (c) => c.TestDetailComponent
          ),
      },
      {
        path: 'my-test/:testId',
        canActivate: [authGuard(['paciente'])],
        loadComponent: () =>
          import('./components/patient-test-detail/patient-test-detail.component').then(
            (c) => c.PatientTestDetailComponent
          ),
      },
    ],
  },
];
