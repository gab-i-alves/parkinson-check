import { Routes } from '@angular/router';

export const PATIENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/patient-dashboard/patient-dashboard.component').then(
        (c) => c.PatientDashboardComponent
      ),
  },
  {
    path: 'my-doctors',
    loadComponent: () =>
      import('./components/my-doctors/my-doctors.component').then(
        (c) => c.MyDoctorsComponent
      ),
  },
  {
    path: 'results',
    loadComponent: () =>
      import('./components/patient-results/patient-results.component').then(
        (c) => c.PatientResultsComponent
      ),
  },
  {
    path: 'patient-requests',
    loadComponent: () =>
      import('./components/patient-binding-requests/patient-binding-requests.component').then(
        (c) => c.PatientBindingRequestsComponent
      ),
  },
  {
    path: 'my-test/:testId',
    loadComponent: () =>
      import('./components/patient-test-detail/patient-test-detail.component').then(
        (c) => c.PatientTestDetailComponent
      ),
  },
];
