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
import { ChartConfiguration, ChartType } from 'chart.js';
import { DoctorDashboardService } from '../../../services/doctor-dashboard.service';
import { DoctorDashboardDataService } from '../../../../../core/services/doctor-dashboard-data.service';
import { DashboardChart } from '../../../../../shared/components/dashboard-chart/dashboard-chart';
import {
  DashboardKPIs,
  PatientNeedingAttention,
} from '../../../../../core/models/doctor-dashboard.model';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardChart, FormsModule],
  templateUrl: './doctor-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorDashboardComponent implements OnInit {
  private doctorDashboardService = inject(DoctorDashboardService);
  private doctorDashboardDataService = inject(DoctorDashboardDataService);
  private cdr = inject(ChangeDetectorRef);

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

  // 3. Performance por Idade (Barra Horizontal)
  public agePerformanceChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  public agePerformanceChartOptions: ChartConfiguration['options'] = {};
  public agePerformanceChartType: ChartType = 'bar';

  // 4. Pacientes por Status (Barra Vertical Empilhada)
  public patientStatusChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  public patientStatusChartOptions: ChartConfiguration['options'] = {};
  public patientStatusChartType: ChartType = 'bar';

  // 5. Frequência de Testes (Área)
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
      error: (err) => console.error('Erro ao carregar overview:', err),
    });

    // 2. Carregar evolução de scores (gráfico de linha dupla)
    this.doctorDashboardDataService.getScoreEvolution('month', 'all').subscribe({
      next: (evolution) => {
        this.setupScoreEvolutionChart(evolution);
      },
      error: (err) => console.error('Erro ao carregar evolução:', err),
    });

    // 3. Carregar distribuição por status (donut)
    this.doctorDashboardDataService.getTestDistribution().subscribe({
      next: (distribution) => {
        this.setupStatusDistributionChart(distribution);
      },
      error: (err) => console.error('Erro ao carregar distribuição:', err),
    });

    // 4. Carregar análise por faixa etária (barra horizontal)
    this.doctorDashboardDataService.getAgeGroupAnalysis().subscribe({
      next: (analysis) => {
        this.setupAgePerformanceChart(analysis);
      },
      error: (err) => console.error('Erro ao carregar análise por idade:', err),
    });

    // 5. Carregar overview novamente para pacientes por status
    this.doctorDashboardDataService.getDashboardOverview().subscribe({
      next: (overview) => {
        this.setupPatientStatusChart(overview);
      },
      error: (err) => console.error('Erro ao carregar status:', err),
    });

    // 6. Carregar evolução para frequência de testes (área)
    this.doctorDashboardDataService.getScoreEvolution('month', 'all').subscribe({
      next: (evolution) => {
        this.setupTestFrequencyChart(evolution);
      },
      error: (err) => console.error('Erro ao carregar frequência:', err),
    });

    // 7. Carregar rankings invertidos (pacientes que precisam atenção)
    this.doctorDashboardDataService.getRankings('overall', 5).subscribe({
      next: (rankings) => {
        this.loadPatientsNeedingAttention(rankings);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar rankings:', err);
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
    // Inverter os rankings para mostrar os piores
    const allPatients = rankings.top_overall_scores || [];
    const worstPatients = [...allPatients].reverse().slice(0, 5);

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
          borderColor: 'rgb(124, 58, 237)',
          backgroundColor: 'rgba(124, 58, 237, 0.5)',
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

  // 3. Gráfico de Performance por Faixa Etária (Barra Horizontal)
  private setupAgePerformanceChart(analysis: any) {
    const ageGroups = analysis.age_groups;
    this.agePerformanceChartData = {
      labels: ageGroups.map((g: any) => g.age_range),
      datasets: [
        {
          data: ageGroups.map((g: any) => g.avg_score),
          label: 'Score Médio',
          backgroundColor: 'rgba(124, 58, 237, 0.8)',
          borderColor: 'rgb(124, 58, 237)',
          borderWidth: 2,
        },
      ],
    };

    this.agePerformanceChartOptions = {
      indexAxis: 'y' as const,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
      scales: {
        x: { beginAtZero: true, max: 1, title: { display: true, text: 'Score' } },
      },
    };

    this.cdr.markForCheck();
  }

  // 4. Gráfico de Pacientes por Status (Barra Vertical)
  private setupPatientStatusChart(overview: any) {
    const status = overview.patients_by_status || { stable: 0, attention: 0, critical: 0 };
    this.patientStatusChartData = {
      labels: ['Status dos Pacientes'],
      datasets: [
        {
          label: 'Estável',
          data: [status.stable],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2,
        },
        {
          label: 'Atenção',
          data: [status.attention],
          backgroundColor: 'rgba(251, 191, 36, 0.8)',
          borderColor: 'rgb(251, 191, 36)',
          borderWidth: 2,
        },
        {
          label: 'Crítico',
          data: [status.critical],
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2,
        },
      ],
    };

    this.patientStatusChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true } },
        title: { display: false },
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Quantidade' } },
      },
    };

    this.cdr.markForCheck();
  }

  // 5. Gráfico de Frequência de Testes (Área)
  private setupTestFrequencyChart(evolution: any) {
    const timeSeries = evolution.time_series;
    this.testFrequencyChartData = {
      labels: timeSeries.map((d: any) => d.date),
      datasets: [
        {
          data: timeSeries.map((d: any) => d.test_count),
          label: 'Quantidade de Testes',
          fill: true,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.3)',
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
    // TODO: Implementar navegação para detalhes do paciente
    console.log('Navegando para paciente:', patientId);
  }
}
