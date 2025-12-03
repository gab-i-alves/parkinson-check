import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute, RouterLink } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { SidebarComponent } from '../../../../shared/components/layout/sidebar/sidebar.component';
import { NotificationContainerComponent } from '../../../../shared/components/notification-container/notification-container.component';
import { AuthService } from '../../../auth/services/auth.services';
import { UserService } from '../../../../core/services/user.service';
import { BreadcrumbService } from '../../../../shared/services/breadcrumb.service';
import { Subscription, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UserProfile } from '../../../../core/models/user.model';

interface Breadcrumb {
  label: string;
  path: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    SidebarComponent,
    NotificationContainerComponent
  ],
  templateUrl: './dashboard-layout.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(-100%)' }))
      ])
    ])
  ]
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private breadcrumbService = inject(BreadcrumbService);

  private userSubscription?: Subscription;
  private routerSubscription?: Subscription;
  private breadcrumbSubscription?: Subscription;

  // State
  isMobileMenuOpen = false;
  isLoading = false;
  breadcrumbs: Breadcrumb[] = [];

  // Observables
  currentUser$: Observable<UserProfile | null>;

  constructor() {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Set current user
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.userService.setCurrentUser(user as UserProfile);
      }
    });

    // Handle route changes for loading state and breadcrumbs
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Show loading briefly on navigation
      this.isLoading = true;
      setTimeout(() => {
        this.isLoading = false;
      }, 300);

      // Update breadcrumbs
      this.updateBreadcrumbs();

      // Close mobile menu on navigation
      this.isMobileMenuOpen = false;
    });

    // Subscribe to breadcrumb overrides
    this.breadcrumbSubscription = this.breadcrumbService.breadcrumbOverrides$.subscribe(() => {
      this.updateBreadcrumbs();
    });

    // Initial breadcrumb
    this.updateBreadcrumbs();
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
    this.breadcrumbSubscription?.unsubscribe();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Bom dia';
    } else if (hour < 18) {
      return 'Boa tarde';
    } else {
      return 'Boa noite';
    }
  }

  getCurrentDate(): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    return now.toLocaleDateString('pt-BR', options);
  }

  getDisplayName(fullName: string, role: string, gender: string): string {
    // Extrair apenas o primeiro nome (sem títulos)
    const firstName = fullName.trim().split(' ')[0] || fullName;

    if (role === 'medico') {
      // Para médicos, adicionar o título apropriado baseado no gênero
      if (gender === 'MALE') {
        return `Dr. ${firstName}`;
      } else if (gender === 'FEMALE') {
        return `Dra. ${firstName}`;
      } else {
        // Para PREFER_NOT_TO_SAY ou qualquer outro valor
        return `Dr(a). ${firstName}`;
      }
    }

    // Para outros usuários (pacientes, admins), mostrar apenas o primeiro nome
    return firstName;
  }

  private updateBreadcrumbs(): void {
    const url = this.router.url;

    // Enhanced breadcrumb mapping based on URL patterns
    const breadcrumbMap: Record<string, Breadcrumb[]> = {
      '/dashboard/doctor/patient': [
        { label: 'Dashboard', path: '/dashboard/doctor' },
        { label: 'Meus Pacientes', path: '/dashboard/doctor/patients' },
        { label: 'Detalhes do Paciente', path: url }
      ],
      '/dashboard/doctor/patients': [
        { label: 'Dashboard', path: '/dashboard/doctor' },
        { label: 'Meus Pacientes', path: '/dashboard/doctor/patients' }
      ],
      '/dashboard/doctor/analytics': [
        { label: 'Dashboard', path: '/dashboard/doctor' },
        { label: 'Análises', path: '/dashboard/doctor/analytics' }
      ],
      '/dashboard/doctor/clinical-test/type-selection': [
        { label: 'Dashboard', path: '/dashboard/doctor' },
        { label: 'Realizar Testes', path: '/dashboard/doctor/clinical-test/patient-selection' },
        { label: 'Carregando...', path: url }
      ],
      '/dashboard/doctor/clinical-test/spiral-method-selection': [
        { label: 'Dashboard', path: '/dashboard/doctor' },
        { label: 'Realizar Testes', path: '/dashboard/doctor/clinical-test/patient-selection' },
        { label: 'Carregando...', path: url },
        { label: 'Tipo de Teste', path: url },
        { label: 'Método do Teste da Espiral', path: url }
      ],
      '/dashboard/tests/clinical/voice': [
        { label: 'Dashboard', path: '/dashboard/doctor' },
        { label: 'Realizar Testes', path: '/dashboard/doctor/clinical-test/patient-selection' },
        { label: 'Carregando...', path: url },
        { label: 'Tipo de Teste', path: url },
        { label: 'Voz', path: url }
      ],
      '/dashboard/tests/clinical/spiral-paper': [
        { label: 'Dashboard', path: '/dashboard/doctor' },
        { label: 'Realizar Testes', path: '/dashboard/doctor/clinical-test/patient-selection' },
        { label: 'Carregando...', path: url },
        { label: 'Tipo de Teste', path: url },
        { label: 'Espiral por Papel', path: url }
      ],
      '/dashboard/tests/clinical/spiral': [
        { label: 'Dashboard', path: '/dashboard/doctor' },
        { label: 'Realizar Testes', path: '/dashboard/doctor/clinical-test/patient-selection' },
        { label: 'Carregando...', path: url },
        { label: 'Tipo de Teste', path: url },
        { label: 'Espiral por Webcam', path: url }
      ],
      '/dashboard/doctor/clinical-test': [
        { label: 'Dashboard', path: '/dashboard/doctor' },
        { label: 'Realizar Testes', path: url }
      ],
      '/dashboard/doctor/binding-requests': [
        { label: 'Dashboard', path: '/dashboard/doctor' },
        { label: 'Solicitações', path: '/dashboard/doctor/binding-requests' }
      ],
      '/dashboard/doctor': [
        { label: 'Dashboard', path: '/dashboard/doctor' },
        { label: 'Visão Geral', path: '/dashboard/doctor' }
      ],
      '/dashboard/admin/approve/:id': [
        { label: 'Dashboard', path: '/dashboard/admin' },
        { label: 'Médicos', path: '/dashboard/admin/doctors' },
        { label: 'Solicitação de Cadastro', path: url }
      ],
      '/dashboard/admin/approve': [
        { label: 'Dashboard', path: '/dashboard/admin' },
        { label: 'Aprovar Cadastros', path: '/dashboard/admin/approve' }
      ],
      '/dashboard/admin/doctors/edit': [
        { label: 'Dashboard', path: '/dashboard/admin' },
        { label: 'Gerenciar Médicos', path: '/dashboard/admin/doctors' },
        { label: 'Carregando...', path: url }
      ],
      '/dashboard/admin/doctors/': [
        { label: 'Dashboard', path: '/dashboard/admin' },
        { label: 'Gerenciar Médicos', path: '/dashboard/admin/doctors' },
        { label: 'Carregando...', path: url }
      ],
      '/dashboard/admin/doctors': [
        { label: 'Dashboard', path: '/dashboard/admin' },
        { label: 'Gerenciar Médicos', path: '/dashboard/admin/doctors' }
      ],
      '/dashboard/admin/users/edit': [
        { label: 'Dashboard', path: '/dashboard/admin' },
        { label: 'Gerenciar Usuários', path: '/dashboard/admin/users' },
        { label: 'Carregando...', path: url }
      ],
      '/dashboard/admin/users/create': [
        { label: 'Dashboard', path: '/dashboard/admin' },
        { label: 'Adicionar Usuários', path: url }
      ],
      '/dashboard/admin/users': [
        { label: 'Dashboard', path: '/dashboard/admin' },
        { label: 'Gerenciar Usuários', path: '/dashboard/admin/users' }
      ],
      '/dashboard/admin': [
        { label: 'Dashboard', path: '/dashboard/admin' },
        { label: 'Visão Geral', path: '/dashboard/admin' }
      ],
      '/dashboard/tests': [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Realizar Testes', path: '/dashboard/tests' }
      ],
      '/dashboard/results': [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Meus Resultados', path: '/dashboard/results' }
      ],
      '/dashboard/my-doctors': [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Meus Médicos', path: '/dashboard/my-doctors' }
      ],
      '/dashboard/my-test': [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Meus Resultados', path: '/dashboard/results' },
        { label: 'Carregando...', path: url }
      ],
      '/dashboard/patient-requests': [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Solicitações', path: '/dashboard/patient-requests' }
      ],
      '/dashboard/notifications': [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Notificações', path: '/dashboard/notifications' }
      ],
      '/dashboard/settings': [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Configurações', path: '/dashboard/settings' }
      ],
      '/dashboard': [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Visão Geral', path: '/dashboard' }
      ]
    };

    // Find most specific matching breadcrumb (longest match first)
    const sortedKeys = Object.keys(breadcrumbMap).sort((a, b) => b.length - a.length);
    const matchingKey = sortedKeys.find(key => url.startsWith(key));

    if (matchingKey && breadcrumbMap[matchingKey]) {
      this.breadcrumbs = breadcrumbMap[matchingKey];

      // Apply dynamic breadcrumb overrides
      const overrideLabel = this.breadcrumbService.getBreadcrumbLabel(url);
      if (overrideLabel && this.breadcrumbs.length > 0) {
        // Find and replace the "Carregando..." breadcrumb with the override label
        const loadingIndex = this.breadcrumbs.findIndex(b => b.label === 'Carregando...');
        if (loadingIndex !== -1) {
          this.breadcrumbs[loadingIndex].label = overrideLabel;
        } else {
          // Fallback: update the last breadcrumb if no "Carregando..." found
          this.breadcrumbs[this.breadcrumbs.length - 1].label = overrideLabel;
        }
      }
    } else {
      this.breadcrumbs = [];
    }
  }
}
