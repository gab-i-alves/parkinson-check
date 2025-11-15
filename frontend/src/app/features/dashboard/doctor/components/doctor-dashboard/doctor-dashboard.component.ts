import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChartConfiguration, ChartType } from 'chart.js';
import { DoctorDashboardService } from '../../../services/doctor-dashboard.service';
import { DoctorDashboardDataService } from '../../../../../core/services/doctor-dashboard-data.service';
import { DashboardChart } from '../../../../../shared/components/dashboard-chart/dashboard-chart';
import {
  DashboardKPIs,
  PatientNeedingAttention,
} from '../../../../../core/models/doctor-dashboard.model';
import { TooltipDirective } from '../../../../../shared/directives/tooltip.directive';
import { ToastService } from '../../../../../shared/services/toast.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardChart, FormsModule, TooltipDirective],
  templateUrl: './doctor-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorDashboardComponent implements OnInit {
  private doctorDashboardService = inject(DoctorDashboardService);
  private doctorDashboardDataService = inject(DoctorDashboardDataService);
  private cdr = inject(ChangeDetectorRef);
  private toastService = inject(ToastService);
  private router = inject(Router);

  readonly isLoading = signal<boolean>(true);
  readonly kpis = signal<DashboardKPIs>({
    totalPatients: 0,
    totalTestsThisMonth: 0,
    avgScoreGeneral: null,
    patientsNeedingAttention: 0,
    adherenceRate: 0,
    newPatientsThisMonth: 0,
    scoreTrend: 'stable',
    scoreTrendPercentage: 0,
  });
  readonly patientsNeedingAttention = signal<PatientNeedingAttention[]>([]);
  readonly rankings = signal<any>(null);

  // Chart.js configurations
  // 1. Evolução de Scores (Linha)
  public scoreEvolutionChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  public scoreEvolutionChartOptions: ChartConfiguration['options'] = {};
  public scoreEvolutionChartType: ChartType = 'line';

  // 2. Distribuição por Status (Donut)
  public statusDistributionChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  public statusDistributionChartOptions: ChartConfiguration['options'] = {};
  public statusDistributionChartType: ChartType = 'doughnut';

  // 3. Frequência de Testes (Área)
  public testFrequencyChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  public testFrequencyChartOptions: ChartConfiguration['options'] = {};
  public testFrequencyChartType: ChartType = 'line';

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.isLoading.set(true);

    // 1. Carregar Overview (para KPIs)
    this.doctorDashboardDataService.getDashboardOverview().subscribe({
      next: (overview) => {
        this.calculateKPIs(overview);
      },
      error: (err) => {
        console.error('Erro ao carregar overview:', err);
        this.toastService.error('Erro ao carregar dados do dashboard', 'Erro');
      },
    });

    // 2. Carregar evolução de scores (gráfico de linha dupla)
    this.doctorDashboardDataService.getScoreEvolution('month', 'all').subscribe({
      next: (evolution) => {
        this.setupScoreEvolutionChart(evolution);
      },
      error: (err) => {
        console.error('Erro ao carregar evolução:', err);
        this.toastService.error('Erro ao carregar evolução de scores', 'Erro');
      },
    });

    // 3. Carregar distribuição por status (donut)
    this.doctorDashboardDataService.getTestDistribution().subscribe({
      next: (distribution) => {
        this.setupStatusDistributionChart(distribution);
      },
      error: (err) => console.error('Erro ao carregar distribuição:', err),
    });

    // 4. Carregar evolução para frequência de testes (área)
    this.doctorDashboardDataService.getScoreEvolution('month', 'all').subscribe({
      next: (evolution) => {
        this.setupTestFrequencyChart(evolution);
      },
      error: (err) => console.error('Erro ao carregar frequência:', err),
    });

    // 5. Carregar rankings invertidos (pacientes que precisam atenção)
    this.doctorDashboardDataService.getRankings('overall', 5).subscribe({
      next: (rankings) => {
        this.loadPatientsNeedingAttention(rankings);
        this.isLoading.set(false);
        this.toastService.success('Dashboard carregado com sucesso!', 'Sucesso');
      },
      error: (err) => {
        console.error('Erro ao carregar rankings:', err);
        this.toastService.error('Erro ao carregar dados de pacientes', 'Erro');
        this.isLoading.set(false);
      },
    });
  }

  private calculateKPIs(overview: any) {
    const totalPatients = overview.total_patients || 0;
    const totalTestsThisMonth = overview.total_tests_this_month || 0;
    const avgScore = overview.avg_score_all_patients;
    const patientsByStatus = overview.patients_by_status || { stable: 0, attention: 0, critical: 0 };

    this.kpis.set({
      totalPatients,
      totalTestsThisMonth,
      avgScoreGeneral: avgScore,
      patientsNeedingAttention: patientsByStatus.attention + patientsByStatus.critical,
      adherenceRate: totalPatients > 0 ? Math.round((totalTestsThisMonth / totalPatients) * 100) : 0,
      newPatientsThisMonth: 0, // TODO: Implementar no backend
      scoreTrend: avgScore > 0.7 ? 'up' : avgScore < 0.5 ? 'down' : 'stable',
      scoreTrendPercentage: 0, // TODO: Calcular tendência
    });
  }

  private loadPatientsNeedingAttention(rankings: any) {
    // Inverter os rankings para mostrar os piores e filtrar apenas pacientes com score < 0.6
    const allPatients = rankings.top_overall_scores || [];
    const worstPatients = [...allPatients]
      .reverse()
      .filter((p: any) => p.avg_score < 0.6); // Apenas pacientes que precisam atenção

    const patientsAttention: PatientNeedingAttention[] = worstPatients.map((p: any) => ({
      patient_id: p.patient_id,
      patient_name: p.patient_name,
      last_test_date: p.last_test_date,
      last_score: p.avg_score,
      avg_score: p.avg_score,
      status: p.avg_score < 0.4 ? 'critical' : 'attention',
      trend: 'stable', // TODO: Implementar cálculo de tendência
      total_tests: p.total_tests,
    }));

    this.patientsNeedingAttention.set(patientsAttention);
  }

  // 1. Gráfico de Evolução de Scores (Linha com 2 datasets)
  private setupScoreEvolutionChart(evolution: any) {
    const timeSeries = evolution.time_series;
    this.scoreEvolutionChartData = {
      labels: timeSeries.map((d: any) => d.date),
      datasets: [
        {
          data: timeSeries.map((d: any) => d.avg_score),
          label: 'Score Médio',
          fill: false,
          borderColor: 'rgb(255, 181, 232)', // pink-200
          backgroundColor: 'rgba(255, 181, 232, 0.5)',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };

    this.scoreEvolutionChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true } },
        title: { display: false },
      },
      scales: {
        y: { beginAtZero: true, max: 1, title: { display: true, text: 'Score' } },
        x: { title: { display: true, text: 'Período' } },
      },
    };

    this.cdr.markForCheck();
  }

  // 2. Gráfico de Distribuição por Status (Donut)
  private setupStatusDistributionChart(distribution: any) {
    const stats = distribution.by_classification;
    this.statusDistributionChartData = {
      labels: ['Saudável', 'Parkinson'],
      datasets: [
        {
          data: [stats.healthy || 0, stats.parkinson || 0],
          backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
          borderColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
          borderWidth: 2,
        },
      ],
    };

    this.statusDistributionChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true } },
        title: { display: false },
      },
    };

    this.cdr.markForCheck();
  }

  // 3. Gráfico de Frequência de Testes (Área)
  private setupTestFrequencyChart(evolution: any) {
    const timeSeries = evolution.time_series;
    this.testFrequencyChartData = {
      labels: timeSeries.map((d: any) => d.date),
      datasets: [
        {
          data: timeSeries.map((d: any) => d.test_count),
          label: 'Quantidade de Testes',
          fill: true,
          borderColor: 'rgb(255, 230, 109)', // yellow-200
          backgroundColor: 'rgba(255, 230, 109, 0.3)',
          tension: 0.4,
        },
      ],
    };

    this.testFrequencyChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Testes' } },
        x: { title: { display: true, text: 'Período' } },
      },
    };

    this.cdr.markForCheck();
  }

  // Método para navegar para detalhes do paciente
  viewPatientDetails(patientId: number) {
    this.router.navigate(['/dashboard/doctor/patient', patientId]);
  }

  // Método para gerar iniciais do nome do paciente
  getPatientInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}
