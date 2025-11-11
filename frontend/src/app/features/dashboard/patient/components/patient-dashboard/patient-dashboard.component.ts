import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { ComparativeStatisticsService } from '../../../../../core/services/comparative-statistics.service';
import { ComparativeStatistics } from '../../../../../core/models/comparative-statistics.model';

type RegionFilter = 'city' | 'state' | 'country';

@Component({
  selector: 'app-patient-dashboard',
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './patient-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientDashboardComponent implements OnInit {
  private comparativeStatsService = inject(ComparativeStatisticsService);

  readonly isLoading = signal<boolean>(true);
  readonly comparativeStats = signal<ComparativeStatistics | null>(null);
  readonly regionFilter = signal<RegionFilter>('city');

  // Chart.js configurations
  public barChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  public barChartOptions: ChartConfiguration['options'] = {};
  public barChartType: ChartType = 'bar';

  public lineChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  public lineChartOptions: ChartConfiguration['options'] = {};
  public lineChartType: ChartType = 'line';

  public horizontalBarChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  public horizontalBarChartOptions: ChartConfiguration['options'] = {};
  public horizontalBarChartType: ChartType = 'bar';

  ngOnInit(): void {
    this.loadComparativeData();
  }

  private loadComparativeData(): void {
    this.comparativeStatsService.getComparativeStatistics().subscribe({
      next: (stats) => {
        this.comparativeStats.set(stats);
        this.initializeCharts();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas comparativas:', err);
        this.isLoading.set(false);
      },
    });
  }

  private initializeCharts(): void {
    const stats = this.comparativeStats();
    if (!stats) return;

    this.setupVerticalBarChart();
    this.setupLineChart();
    this.setupHorizontalBarChart();
  }

  private setupVerticalBarChart(): void {
    const stats = this.comparativeStats();
    if (!stats) return;

    this.barChartData = {
      labels: ['Você', 'Média Global'],
      datasets: [
        {
          data: [stats.patient_avg_score, stats.global_avg_score || 0],
          label: 'Score Médio',
          backgroundColor: ['rgba(219, 39, 119, 0.8)', 'rgba(163, 163, 163, 0.6)'],
          borderColor: ['rgb(219, 39, 119)', 'rgb(163, 163, 163)'],
          borderWidth: 2,
        },
      ],
    };

    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
      scales: {
        y: { beginAtZero: true, max: 1 },
      },
    };
  }


  private setupLineChart(): void {
    const stats = this.comparativeStats();
    if (!stats) return;

    const selectedRegion = this.regionFilter();
    const regionalAvg = stats.regional_avg[selectedRegion] || 0;

    this.lineChartData = {
      labels: ['Score Médio'],
      datasets: [
        {
          data: [stats.patient_avg_score],
          label: 'Você',
          borderColor: 'rgb(219, 39, 119)',
          backgroundColor: 'rgba(219, 39, 119, 0.1)',
          tension: 0.4,
        },
        {
          data: [stats.age_group_avg_score || 0],
          label: `Média ${stats.demographics.age_group} anos`,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
        {
          data: [regionalAvg],
          label: `Média ${this.getRegionLabel()}`,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
        },
      ],
    };

    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
      },
      scales: {
        y: { beginAtZero: true, max: 1 },
      },
    };
  }

  private setupHorizontalBarChart(): void {
    const stats = this.comparativeStats();
    if (!stats) return;

    const maleAvg = stats.gender_avg.male || 0;
    const femaleAvg = stats.gender_avg.female || 0;

    this.horizontalBarChartData = {
      labels: ['Masculino', 'Feminino', 'Você'],
      datasets: [
        {
          data: [maleAvg, femaleAvg, stats.patient_avg_score],
          label: 'Score Médio',
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(236, 72, 153, 0.7)',
            'rgba(219, 39, 119, 0.8)',
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(236, 72, 153)',
            'rgb(219, 39, 119)',
          ],
          borderWidth: 2,
        },
      ],
    };

    this.horizontalBarChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { beginAtZero: true, max: 1 },
      },
    };
  }

  getPercentileColor(percentile: number): string {
    if (percentile >= 75) return 'rgba(34, 197, 94, 0.8)'; // green
    if (percentile >= 50) return 'rgba(59, 130, 246, 0.8)'; // blue
    if (percentile >= 25) return 'rgba(251, 146, 60, 0.8)'; // orange
    return 'rgba(239, 68, 68, 0.8)'; // red
  }

  getPercentileLabel(percentile: number | null): string {
    if (percentile === null) return 'N/A';
    if (percentile >= 75) return 'Excelente';
    if (percentile >= 50) return 'Bom';
    if (percentile >= 25) return 'Regular';
    return 'Precisa Atenção';
  }

  getPercentileMedal(percentile: number | null): string {
    if (percentile === null) return '';
    if (percentile >= 90) return '🥇';
    if (percentile >= 75) return '🥈';
    if (percentile >= 50) return '🥉';
    return '';
  }

  getRegionLabel(): string {
    const filter = this.regionFilter();
    const stats = this.comparativeStats();
    if (!stats) return '';

    switch (filter) {
      case 'city':
        return stats.demographics.city;
      case 'state':
        return stats.demographics.state;
      case 'country':
        return stats.demographics.country;
      default:
        return '';
    }
  }

  onRegionFilterChange(region: RegionFilter): void {
    this.regionFilter.set(region);
    this.setupLineChart();
  }
}
