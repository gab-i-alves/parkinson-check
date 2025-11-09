import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecentTestsListComponent } from '../../../shared/components/recent-tests-list/recent-tests-list.component';
import { TestDetailService } from '../../../services/test-detail.service';
import { PatientStatistics } from '../../../../../core/models/patient-statistics.model';
import { TimelineTestItem } from '../../../../../core/models/patient-timeline.model';

@Component({
  selector: 'app-patient-dashboard',
  imports: [CommonModule],
  templateUrl: './patient-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientDashboardComponent implements OnInit {
  private testDetailService = inject(TestDetailService);

  readonly isLoading = signal<boolean>(true);
  readonly statistics = signal<PatientStatistics | null>(null);
  readonly recentTests = signal<TimelineTestItem[]>([]);

  ngOnInit(): void {
    this.loadTestsData();
  }

  private loadTestsData(): void {
    // Load statistics
    this.testDetailService.getMyTestsStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas:', err);
        this.isLoading.set(false);
      },
    });

    // Load recent tests
    this.testDetailService.getMyTestsTimeline().subscribe({
      next: (timeline) => {
        this.recentTests.set(timeline.tests.slice(0, 5));
      },
      error: (err) => {
        console.error('Erro ao carregar testes recentes:', err);
      },
    });
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'improving':
        return '↑';
      case 'worsening':
        return '↓';
      default:
        return '→';
    }
  }

  getTrendColor(trend: string): string {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'worsening':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  getTrendLabel(trend: string): string {
    switch (trend) {
      case 'improving':
        return 'Melhorando';
      case 'worsening':
        return 'Piorando';
      default:
        return 'Estável';
    }
  }

  formatScore(score: number | null): string {
    if (score === null) return 'N/A';
    return score.toFixed(2);
  }
}
