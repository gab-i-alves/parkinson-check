import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';

// Services
import { AdminDashboardService } from '../../../services/admin-dashboard.service';
import { ToastService } from '../../../../../shared/services/toast.service';

// Components
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';

// Directives
import { TooltipDirective } from '../../../../../shared/directives/tooltip.directive';

// Models
import { AdminStats } from '../../../../../core/models/admin-stats.model';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BadgeComponent,
    TooltipDirective,
  ],
  templateUrl: './admin-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-10px)' }),
          stagger(50, [
            animate('200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
  ],
})
export class AdminDashboardComponent {
  private adminDashboardService = inject(AdminDashboardService);
  private toastService = inject(ToastService);

  // State signals
  readonly adminStats = signal<AdminStats | undefined>(undefined);
  readonly isLoading = signal<boolean>(true);
  readonly isRefreshing = signal<boolean>(false);
  readonly activeTab = signal<'overview' | 'pending' | 'activity'>('overview');

  // Search and filter
  readonly searchTerm = signal<string>('');
  readonly selectedFilter = signal<string>('all');

  // Data signals
  readonly pendentDoctors = this.adminDashboardService.pendentDoctors;

  // Computed signals
  readonly filteredDoctors = computed(() => {
    const doctors = this.pendentDoctors();
    const search = this.searchTerm().toLowerCase();

    if (!search) return doctors;

    return doctors.filter(doctor =>
      doctor.name.toLowerCase().includes(search)
    );
  });

  readonly hasPendingDoctors = computed(() => this.pendentDoctors().length > 0);

  // Chart data
  readonly userDistributionData = computed(() => {
    const stats = this.adminStats();
    if (!stats) return null;

    return {
      labels: ['Pacientes', 'Médicos'],
      datasets: [{
        data: [stats.total_patients, stats.total_doctors],
        backgroundColor: ['#fecaca', '#bfdbfe'],
      }],
    };
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);

    this.adminDashboardService.getDashboardStats().subscribe({
      next: (response: AdminStats) => {
        this.adminStats.set(response);
        this.isLoading.set(false);
        this.toastService.success('Dados do sistema carregados com sucesso!');
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.toastService.error(
          'Erro ao carregar dados do sistema. Tente novamente.'
        );
        console.error('Erro ao buscar dados do sistema:', err);
      },
    });
  }

  refreshData(): void {
    this.isRefreshing.set(true);

    this.adminDashboardService.getDashboardStats().subscribe({
      next: (response: AdminStats) => {
        this.adminStats.set(response);
        this.isRefreshing.set(false);
        this.toastService.info('Dados atualizados!');
      },
      error: (err: HttpErrorResponse) => {
        this.isRefreshing.set(false);
        this.toastService.error('Erro ao atualizar dados.');
        console.error('Erro ao atualizar dados:', err);
      },
    });
  }

  setActiveTab(tab: 'overview' | 'pending' | 'activity'): void {
    this.activeTab.set(tab);
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  onFilterChange(filter: string): void {
    this.selectedFilter.set(filter);
  }

  navigateToStatDetail(statType: string): void {
    switch(statType) {
      case 'users':
        // Navigate to users management
        break;
      case 'doctors':
        // Navigate to doctors management
        break;
      case 'patients':
        // Navigate to patients management
        break;
      case 'pending':
        this.setActiveTab('pending');
        break;
    }
  }
}
