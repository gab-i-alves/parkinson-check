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
import { UserProfile } from '../../../../core/models/user.model';

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

  readonly user = this.userService.currentUser;

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
      disabled: true,
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
      disabled: true,
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
      disabled: true,
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
