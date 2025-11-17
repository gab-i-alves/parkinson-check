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
        path: 'patient-selector',
        canActivate: [authGuard(['medico'])],
        loadComponent: () =>
          import(
            './doctor/components/patient-selector/patient-selector.component'
          ).then((c) => c.PatientSelectorComponent),
      },
      {
        path: 'clinical-test/type-selection/:patientId',
        canActivate: [authGuard(['medico'])],
        loadComponent: () =>
          import(
            './doctor/components/clinical-test-type-selection/clinical-test-type-selection.component'
          ).then((c) => c.ClinicalTestTypeSelectionComponent),
      },
      {
        path: 'clinical-test/spiral/:patientId',
        canActivate: [authGuard(['medico'])],
        loadComponent: () =>
          import('./tests/components/spiral-test-webcam/spiral-test-webcam.component').then(
            (c) => c.SpiralTestWebcamComponent
          ),
      },
      {
        path: 'clinical-test/voice/:patientId',
        canActivate: [authGuard(['medico'])],
        loadComponent: () =>
          import('./tests/components/voice-test/voice-test.component').then((c) => c.VoiceTestComponent),
      },
      {
        path: 'clinical-test/result',
        canActivate: [authGuard(['medico'])],
        loadComponent: () =>
          import(
            './doctor/components/clinical-test-result/clinical-test-result.component'
          ).then((c) => c.ClinicalTestResultComponent),
      },
      {
        path: 'patient/:id',
        canActivate: [authGuard(['medico'])],
        loadComponent: () =>
          import('./doctor/components/patient-detail/patient-detail.component').then(
            (c) => c.PatientDetailComponent
          ),
      },
      {
        path: 'test/:testId',
        canActivate: [authGuard(['medico'])],
        loadComponent: () =>
          import('./doctor/components/test-detail/test-detail.component').then(
            (c) => c.TestDetailComponent
          ),
      },
      {
        path: 'my-test/:testId',
        canActivate: [authGuard(['paciente'])],
        loadComponent: () =>
          import(
            './patient/components/patient-test-detail/patient-test-detail.component'
          ).then((c) => c.PatientTestDetailComponent),
      },
      {
        path: 'admin',
        canActivate: [authGuard(['admin'])],
        loadComponent: () =>
          import('./components/admin-dashboard/admin-dashboard.component').then(
            (c) => c.AdminDashboardComponent
          ),
      },
      {
        path: 'users',
        canActivate: [authGuard(['admin'])],
        loadComponent: () =>
          import('./components/user-management/user-management.component').then(
            (c) => c.UserManagementComponent
          ),
      },
      {
        path: 'doctors',
        canActivate: [authGuard(['admin'])],
        loadComponent: () =>
          import('./components/doctor-management/doctor-management.component').then(
            (c) => c.DoctorManagementComponent
          ),
      },
      {
        path: 'doctors/:id',
        canActivate: [authGuard(['admin'])],
        loadComponent: () =>
          import('./components/doctor-detail/doctor-detail.component').then(
            (c) => c.DoctorDetailComponent
          ),
      },
      {
        path: 'approve/:id',
        canActivate: [authGuard(['admin'])],
        loadComponent: () =>
          import('./components/doctor-approval/doctor-approval.component').then(
            (c) => c.DoctorApprovalComponent
          ),
      },
      {
        path: 'users/edit/:id',
        canActivate: [authGuard(['admin'])],
        loadComponent: () =>
          import('./components/edit-user/edit-user.component').then(
            (c) => c.EditUserComponent
          ),
      },
    ],
  },
];
