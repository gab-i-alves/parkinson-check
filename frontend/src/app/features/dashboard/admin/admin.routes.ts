import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/admin-dashboard/admin-dashboard.component').then(
        (c) => c.AdminDashboardComponent
      ),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./components/user-management/user-management.component').then(
        (c) => c.UserManagementComponent
      ),
  },
  {
    path: 'users/create',
    loadComponent: () =>
      import('./components/create-user/create-user.component').then(
        (c) => c.CreateUserComponent
      ),
  },
  {
    path: 'users/edit/:id',
    loadComponent: () =>
      import('./components/edit-user/edit-user.component').then(
        (c) => c.EditUserComponent
      ),
  },
  {
    path: 'doctors',
    loadComponent: () =>
      import('./components/doctor-management/doctor-management.component').then(
        (c) => c.DoctorManagementComponent
      ),
  },
  {
    path: 'doctors/:id',
    loadComponent: () =>
      import('./components/doctor-detail/doctor-detail.component').then(
        (c) => c.DoctorDetailComponent
      ),
  },
  {
    path: 'doctors/edit/:id',
    loadComponent: () =>
      import('./components/edit-doctor/edit-doctor.component').then(
        (c) => c.EditDoctorComponent
      ),
  },
  {
    path: 'approve',
    loadComponent: () =>
      import('./components/doctor-management/doctor-management.component').then(
        (c) => c.DoctorManagementComponent
      ),
  },
  {
    path: 'approve/:id',
    loadComponent: () =>
      import('./components/doctor-approval/doctor-approval.component').then(
        (c) => c.DoctorApprovalComponent
      ),
  },
];
