import {
  ChangeDetectionStrategy,
  Component,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../features/auth/services/auth.services';
import { toSignal } from '@angular/core/rxjs-interop';

interface NavLink {
  path: string;
  label: string;
  icon: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly user = toSignal(this.userService.currentUser$, {
    initialValue: this.userService.getCurrentUser(),
  });

  private patientLinks: NavLink[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: 'home',
      disabled: false,
    },
    {
      path: '/dashboard/tests',
      label: 'Realizar Testes',
      icon: 'clipboard',
      disabled: false,
    },
    {
      path: '/dashboard/results',
      label: 'Meus Resultados',
      icon: 'chart',
      disabled: false,
    },
    {
      path: '/dashboard/my-doctors',
      label: 'Meus Médicos',
      icon: 'users',
      disabled: false,
    },
    {
      path: '/dashboard/patient-requests',
      label: 'Solicitações',
      icon: 'clipboard',
      disabled: false,
    },
  ];

  private doctorLinks: NavLink[] = [
    {
      path: '/dashboard/doctor',
      label: 'Dashboard',
      icon: 'home',
      disabled: false,
    },
    {
      path: '/dashboard/doctor/clinical-test/patient-selection',
      label: 'Realizar Testes',
      icon: 'clipboard',
      disabled: false,
    },
    {
      path: '/dashboard/doctor/analytics',
      label: 'Análises',
      icon: 'chart',
      disabled: true,
    },
    {
      path: '/dashboard/doctor/patients',
      label: 'Meus Pacientes',
      icon: 'users',
      disabled: false,
    },
    {
      path: '/dashboard/doctor/binding-requests',
      label: 'Solicitações',
      icon: 'clipboard',
      disabled: false,
    },
  ];

  readonly navLinks = computed(() => {
    const currentUser = this.user();
    if (currentUser?.role === 'medico') {
      return this.doctorLinks;
    }
    return this.patientLinks;
  });

  readonly notificationCount = signal<number>(3);

  formatUserRole(role: string): string {
    const roleMap: Record<string, string> = {
      paciente: 'Paciente',
      medico: 'Médico',
      admin: 'Administrador',
    };
    return roleMap[role] || role;
  }

  logout(): void {
    // authService.logout() already handles navigation to /auth/login
    this.authService.logout();
  }
}
