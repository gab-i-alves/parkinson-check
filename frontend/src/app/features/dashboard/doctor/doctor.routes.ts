import { Routes } from '@angular/router';

export const DOCTOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/doctor-dashboard/doctor-dashboard.component').then(
        (c) => c.DoctorDashboardComponent
      ),
  },
  {
    path: 'patients',
    loadComponent: () =>
      import('./components/my-patients/my-patients-list.component').then(
        (c) => c.MyPatientsListComponent
      ),
  },
  {
    path: 'binding-requests',
    loadComponent: () =>
      import('./components/binding-requests/binding-requests.component').then(
        (c) => c.BindingRequestsComponent
      ),
  },
  {
    path: 'patient/:id',
    loadComponent: () =>
      import('./components/patient-detail/patient-detail.component').then(
        (c) => c.PatientDetailComponent
      ),
  },
  {
    path: 'clinical-test/patient-selection',
    loadComponent: () =>
      import('./components/patient-selector/patient-selector.component').then(
        (c) => c.PatientSelectorComponent
      ),
  },
  {
    path: 'clinical-test/type-selection/:patientId',
    loadComponent: () =>
      import('./components/clinical-test-type-selection/clinical-test-type-selection.component').then(
        (c) => c.ClinicalTestTypeSelectionComponent
      ),
  },
  {
    path: 'clinical-test/result',
    loadComponent: () =>
      import('./components/clinical-test-result/clinical-test-result.component').then(
        (c) => c.ClinicalTestResultComponent
      ),
  },
  {
    path: 'test/:testId',
    loadComponent: () =>
      import('./components/test-detail/test-detail.component').then(
        (c) => c.TestDetailComponent
      ),
  },
];
