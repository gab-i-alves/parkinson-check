import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { ChartCardComponent } from '../../../../shared/components/chart-card/chart-card.component';
import { RouterLink } from '@angular/router';
import { DoctorDashboardService } from '../../services/doctor-dashboard.service';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminStats } from '../../../../core/models/admin-stats.model';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent],
  templateUrl: './admin-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  private adminDashboardService = inject(AdminDashboardService);

  adminStats: AdminStats | undefined;

  readonly pendentDoctors = this.adminDashboardService.pendentDoctors;

  readonly isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.adminDashboardService.getDashboardStats().subscribe({
      next: (response: any) => {
        console.log('dados do sistema resgatados', response);
        this.adminStats = response;
        console.log(this.adminStats);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao buscar dados do sistema:', err);
      },
    });
  }

  constructor() {
    setTimeout(() => this.isLoading.set(false), 1000);
  }
}
