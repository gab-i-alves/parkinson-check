import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  signal,
  inject,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

// Services
import { AdminDashboardService } from '../../../services/admin-dashboard.service';
import { ToastService } from '../../../../../shared/services/toast.service';

// Directives
import { TooltipDirective } from '../../../../../shared/directives/tooltip.directive';

// Models
import { AdminStats } from '../../../../../core/models/admin-stats.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TooltipDirective,
  ],
  templateUrl: './admin-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit {
  private adminDashboardService = inject(AdminDashboardService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  // State signals
  readonly adminStats = signal<AdminStats | undefined>(undefined);
  readonly isLoading = signal<boolean>(true);

  // Data signals
  readonly pendentDoctors = this.adminDashboardService.pendentDoctors;

  // Computed signals
  readonly hasPendingDoctors = computed(() => this.pendentDoctors().length > 0);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);

    this.adminDashboardService.getDashboardStats().subscribe({
      next: (response: AdminStats) => {
        this.adminStats.set(response);
        this.isLoading.set(false);
        this.toastService.success('Dashboard carregado com sucesso!', 'Sucesso');
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.toastService.error('Erro ao carregar dados do dashboard', 'Erro');
        console.error('Erro ao buscar dados do sistema:', err);
        this.cdr.markForCheck();
      },
    });
  }

  viewDoctorDetails(doctorId: number): void {
    this.router.navigate(['/dashboard/approve', doctorId]);
  }

  getDoctorInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}
