import {
  ChangeDetectionStrategy,
  Component,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../features/auth/services/auth.services';
import { BackendNotificationService } from '../../../../core/services/backend-notification.service';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { BadgeComponent } from '../../badge/badge.component';
import { toSignal } from '@angular/core/rxjs-interop';

interface NavLink {
  path: string;
  label: string;
  icon: string;
  disabled?: boolean;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'info' | 'pink' | 'yellow' | 'blue';
  };
  tooltip?: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    TooltipDirective,
    BadgeComponent,
  ],
  templateUrl: './sidebar.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('200ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ height: 0, opacity: 0 })),
      ]),
    ]),
    trigger('rotate', [
      transition('false => true', [
        animate('200ms ease-out', style({ transform: 'rotate(180deg)' })),
      ]),
      transition('true => false', [
        animate('200ms ease-in', style({ transform: 'rotate(0deg)' })),
      ]),
    ]),
  ],
})
export class SidebarComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private notificationService = inject(BackendNotificationService);
  private router = inject(Router);

  // State
  isUserMenuOpen = signal(false);
  isLoading = signal(true);

  readonly user = toSignal(this.userService.currentUser$, {
    initialValue: this.userService.getCurrentUser(),
  });

  private patientLinks: NavLink[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: 'home',
      disabled: false,
      tooltip: 'Visão geral',
    },
    {
      path: '/dashboard/tests',
      label: 'Realizar Testes',
      icon: 'clipboard',
      disabled: false,
      tooltip: 'Iniciar novo teste',
    },
    {
      path: '/dashboard/results',
      label: 'Meus Resultados',
      icon: 'chart',
      disabled: false,
      tooltip: 'Ver histórico de resultados',
    },
    {
      path: '/dashboard/my-doctors',
      label: 'Meus Médicos',
      icon: 'users',
      disabled: false,
      tooltip: 'Gerenciar médicos',
    },
    {
      path: '/dashboard/patient-requests',
      label: 'Solicitações',
      icon: 'clipboard',
      disabled: false,
      tooltip: 'Ver solicitações pendentes',
    },
    {
      path: '/dashboard/settings',
      label: 'Configurações',
      icon: 'settings',
      disabled: false,
      tooltip: 'Configurações da conta',
    },
  ];

  private doctorLinks: NavLink[] = [
    {
      path: '/dashboard/doctor',
      label: 'Dashboard',
      icon: 'home',
      disabled: false,
      tooltip: 'Visão geral',
    },
    {
      path: '/dashboard/doctor/clinical-test/patient-selection',
      label: 'Realizar Testes',
      icon: 'clipboard',
      disabled: false,
      tooltip: 'Aplicar testes clínicos',
    },
    // {
    //   path: '/dashboard/doctor/analytics',
    //   label: 'Análises',
    //   icon: 'chart',
    //   disabled: false,
    //   tooltip: 'Análises e estatísticas'
    // },
    {
      path: '/dashboard/doctor/patients',
      label: 'Meus Pacientes',
      icon: 'users',
      disabled: false,
      tooltip: 'Gerenciar pacientes',
    },
    {
      path: '/dashboard/doctor/binding-requests',
      label: 'Solicitações',
      icon: 'clipboard',
      disabled: false,
      tooltip: 'Ver solicitações de vínculo',
    },
  ];

  private adminLinks: NavLink[] = [
    {
      path: '/dashboard/admin',
      label: 'Dashboard',
      icon: 'home',
      disabled: false,
    },
    {
      path: '/dashboard/admin/users',
      label: 'Gerenciar Usuários',
      icon: 'users',
      disabled: false,
    },
    {
      path: '/dashboard/admin/doctors',
      label: 'Gerenciar Médicos',
      icon: 'users',
      disabled: false,
    },
    {
      path: '/dashboard/admin/approve',
      label: 'Aprovar Cadastros',
      icon: 'chart',
      disabled: false,
    },
    {
      path: '/dashboard/admin/users/create',
      label: 'Adicionar Usuários',
      icon: 'user-plus',
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

  readonly notificationCount = this.notificationService.unreadCount$;

  ngOnInit(): void {
    // Start polling for notifications every 30 seconds
    this.notificationService.startPolling(30000);

    // Simulate loading state
    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  ngOnDestroy(): void {
    // Stop polling when component is destroyed
    this.notificationService.stopPolling();
  }

  formatUserRole(role: string): string {
    const roleMap: Record<string, string> = {
      paciente: 'Paciente',
      medico: 'Médico',
      admin: 'Administrador',
    };
    return roleMap[role] || role;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update((value) => !value);
  }

  navigateToProfile(): void {
    this.router.navigate(['/dashboard/settings']);
    this.isUserMenuOpen.set(false);
  }

  logout(): void {
    this.isUserMenuOpen.set(false);
    this.authService.logout();
  }
}
