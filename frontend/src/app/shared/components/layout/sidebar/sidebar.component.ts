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
      disabled: true,
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
      path: 'doctor',
      label: 'Dashboard',
      icon: 'home',
      disabled: false,
    },
    {
      path: 'patients',
      label: 'Meus Pacientes',
      icon: 'users',
      disabled: false,
    },
    {
      path: 'binding-requests',
      label: 'Solicitações',
      icon: 'clipboard',
      disabled: false,
    },
    {
      path: 'analytics',
      label: 'Análises',
      icon: 'chart',
      disabled: false,
    },
  ];

  private adminLinks: NavLink[] = [
    {
      path: 'admin',
      label: 'Dashboard',
      icon: 'home',
      disabled: false,
    },
    {
      path: 'users',
      label: 'Gerenciar Usuários',
      icon: 'users',
      disabled: false,
    },
    {
      path: 'doctors',
      label: 'Gerenciar Médicos',
      icon: 'users',
      disabled: false,
    },
    {
      path: 'approve',
      label: 'Aprovar Cadastros',
      icon: 'chart',
      disabled: false,
    },
  ];

  readonly navLinks = computed(() => {
    const currentUser = this.user();
    if (currentUser?.role === 'medico') {
      return this.doctorLinks;
    } else if (currentUser?.role === 'admin') {
      return this.adminLinks;
    }
    return this.patientLinks;
  });

  readonly notificationCount = signal<number>(3);

  logout(): void {
    // authService.logout() already handles navigation to /auth/login
    this.authService.logout();
  }
}
