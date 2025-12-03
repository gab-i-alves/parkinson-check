import { Component, Input, OnChanges, ViewChild, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientTimeline } from '../../../../../core/models/patient-timeline.model';
import { PatientStatistics } from '../../../../../core/models/patient-statistics.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { TooltipDirective } from '../../../../../shared/directives/tooltip.directive';
import { ToastService } from '../../../../../shared/services/toast.service';

interface ChartDataPoint {
  date: string;
  score: number;
  type: 'spiral' | 'voice';
  classification: string;
  executionDate: Date;
}

interface ComputedStatistics {
  totalTests: number;
  totalSpiralTests: number;
  totalVoiceTests: number;
  avgSpiralScore: number;
  avgVoiceScore: number;
  bestSpiralScore: number;
  worstSpiralScore: number;
  bestVoiceScore: number;
  worstVoiceScore: number;
  firstTestDate: string;
  lastTestDate: string;
  avgDaysBetweenTests: number;
  trend: 'improving' | 'stable' | 'declining';
  trendPercentage: number;
}

@Component({
  selector: 'app-charts-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, TooltipDirective],
  templateUrl: './charts-tab.component.html',
})
export class ChartsTabComponent implements OnChanges {
  @Input() timeline: PatientTimeline | null = null;
  @Input() statistics: PatientStatistics | null = null;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  readonly chartData = signal<ChartDataPoint[]>([]);
  readonly selectedTestType = signal<'all' | 'spiral' | 'voice'>('all');
  readonly computedStats = signal<ComputedStatistics | null>(null);

  // Line Chart Configuration
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y?.toFixed(1) || '0';
            const status = Number(value) >= 70 ? 'Saudável' : 'Atenção';
            return `${label}: ${value} pts (${status})`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Data do Teste'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Score (0-100)'
        },
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value
        }
      }
    }
  };

  public lineChartType: ChartType = 'line';

  // Pie Chart Configuration
  public pieChartData: ChartConfiguration['data'] = {
    labels: ['Saudável', 'Parkinson'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#10b981', '#ef4444'],
      hoverBackgroundColor: ['#059669', '#dc2626'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} testes (${percentage}%)`;
          }
        }
      }
    }
  };

  public pieChartType: ChartType = 'pie';

  // Bar Chart Configuration - Scores Médios por Mês
  public barChartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y?.toFixed(1) || '0';
            return `${label}: ${value} pts (média do mês)`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Mês'
        }
      },
      y: {
        display: true,
        max: 100,
        title: {
          display: true,
          text: 'Score Médio'
        },
        beginAtZero: true
      }
    }
  };

  public barChartType: ChartType = 'bar';

  // Radar Chart Configuration - Análise Multidimensional
  public radarChartData: ChartConfiguration['data'] = {
    labels: ['Score Médio', 'Consistência', 'Frequência', 'Tendência', 'Qualidade'],
    datasets: []
  };

  public radarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    }
  };

  public radarChartType: ChartType = 'radar';

  readonly filteredChartData = computed(() => {
    if (this.selectedTestType() === 'all') {
      return this.chartData();
    }
    return this.chartData().filter((d) => d.type === this.selectedTestType());
  });

  constructor() {
    // Update charts when filter changes
    effect(() => {
      this.filteredChartData();
      this.updateLineChart();
      this.updateBarChart();
      this.updateRadarChart();
    });
  }

  ngOnChanges(): void {
    this.processChartData();
    this.calculateStatistics();
    this.updateLineChart();
    this.updatePieChart();
    this.updateBarChart();
    this.updateRadarChart();
  }

  processChartData(): void {
    if (!this.timeline) return;

    const data: ChartDataPoint[] = this.timeline.tests.map((test) => ({
      date: new Date(test.execution_date).toLocaleDateString('pt-BR'),
      score: test.score,
      executionDate: new Date(test.execution_date),
      type: test.test_type === 'SPIRAL_TEST' || (test.test_type as any) === 1 ? 'spiral' : 'voice',
      classification: test.classification,
    }));

    // Sort by date (oldest first for charts)
    data.sort((a, b) => a.executionDate.getTime() - b.executionDate.getTime());

    this.chartData.set(data);
  }

  calculateStatistics(): void {
    if (!this.timeline || this.timeline.tests.length === 0) {
      this.computedStats.set(null);
      return;
    }

    const tests = this.filteredChartData();
    if (tests.length === 0) {
      this.computedStats.set(null);
      return;
    }

    const spiralTests = tests.filter(t => t.type === 'spiral');
    const voiceTests = tests.filter(t => t.type === 'voice');

    const avgSpiralScore = spiralTests.length > 0
      ? spiralTests.reduce((sum, t) => sum + t.score, 0) / spiralTests.length
      : 0;

    const avgVoiceScore = voiceTests.length > 0
      ? voiceTests.reduce((sum, t) => sum + t.score, 0) / voiceTests.length
      : 0;

    const spiralScores = spiralTests.map(t => t.score);
    const voiceScores = voiceTests.map(t => t.score);

    // Calculate trend
    const { trend, percentage } = this.calculateTrend(tests);

    // Calculate average days between tests
    let avgDaysBetweenTests = 0;
    if (tests.length > 1) {
      const sortedDates = tests.map(t => t.executionDate.getTime()).sort((a, b) => a - b);
      let totalDays = 0;
      for (let i = 1; i < sortedDates.length; i++) {
        const daysDiff = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
        totalDays += daysDiff;
      }
      avgDaysBetweenTests = totalDays / (sortedDates.length - 1);
    }

    this.computedStats.set({
      totalTests: tests.length,
      totalSpiralTests: spiralTests.length,
      totalVoiceTests: voiceTests.length,
      avgSpiralScore,
      avgVoiceScore,
      bestSpiralScore: spiralScores.length > 0 ? Math.max(...spiralScores) : 0,
      worstSpiralScore: spiralScores.length > 0 ? Math.min(...spiralScores) : 0,
      bestVoiceScore: voiceScores.length > 0 ? Math.max(...voiceScores) : 0,
      worstVoiceScore: voiceScores.length > 0 ? Math.min(...voiceScores) : 0,
      firstTestDate: tests[0].date,
      lastTestDate: tests[tests.length - 1].date,
      avgDaysBetweenTests: Math.round(avgDaysBetweenTests),
      trend,
      trendPercentage: percentage
    });
  }

  calculateTrend(tests: ChartDataPoint[]): { trend: 'improving' | 'stable' | 'declining', percentage: number } {
    if (tests.length < 2) {
      return { trend: 'stable', percentage: 0 };
    }

    // Compare average of first half vs second half
    const midpoint = Math.floor(tests.length / 2);
    const firstHalf = tests.slice(0, midpoint);
    const secondHalf = tests.slice(midpoint);

    const avgFirst = firstHalf.reduce((sum, t) => sum + t.score, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, t) => sum + t.score, 0) / secondHalf.length;

    const percentageChange = ((avgSecond - avgFirst) / avgFirst) * 100;

    let trend: 'improving' | 'stable' | 'declining';
    if (Math.abs(percentageChange) < 5) {
      trend = 'stable';
    } else if (percentageChange > 0) {
      trend = 'improving';
    } else {
      trend = 'declining';
    }

    return { trend, percentage: Math.abs(percentageChange) };
  }

  updateLineChart(): void {
    const data = this.filteredChartData();
    if (data.length === 0) {
      this.lineChartData = {
        datasets: [],
        labels: []
      };
      this.chart?.update();
      return;
    }

    const spiralData = data.filter(d => d.type === 'spiral');
    const voiceData = data.filter(d => d.type === 'voice');

    const datasets = [];

    if (spiralData.length > 0 && (this.selectedTestType() === 'all' || this.selectedTestType() === 'spiral')) {
      datasets.push({
        label: 'Teste de Espiral',
        data: spiralData.map(d => d.score * 100),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
      });
    }

    if (voiceData.length > 0 && (this.selectedTestType() === 'all' || this.selectedTestType() === 'voice')) {
      datasets.push({
        label: 'Teste de Voz',
        data: voiceData.map(d => d.score * 100),
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
      });
    }

    // Get unique dates and align data
    const allDates = Array.from(new Set(data.map(d => d.date)));

    this.lineChartData = {
      labels: allDates,
      datasets: datasets as any
    };

    this.chart?.update();
  }

  updatePieChart(): void {
    const data = this.filteredChartData();
    const healthyCount = data.filter(d => d.classification === 'HEALTHY').length;
    const parkinsonCount = data.filter(d => d.classification === 'PARKINSON').length;

    this.pieChartData = {
      labels: ['Saudável', 'Parkinson'],
      datasets: [{
        data: [healthyCount, parkinsonCount],
        backgroundColor: ['#10b981', '#ef4444'],
        hoverBackgroundColor: ['#059669', '#dc2626'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }

  updateBarChart(): void {
    const data = this.filteredChartData();
    if (data.length === 0) {
      this.barChartData = {
        datasets: [],
        labels: []
      };
      return;
    }

    // Group by month
    const monthlyData = new Map<string, { spiral: number[], voice: number[] }>();

    data.forEach(test => {
      const monthYear = test.executionDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' });
      if (!monthlyData.has(monthYear)) {
        monthlyData.set(monthYear, { spiral: [], voice: [] });
      }
      const monthData = monthlyData.get(monthYear)!;
      if (test.type === 'spiral') {
        monthData.spiral.push(test.score);
      } else {
        monthData.voice.push(test.score);
      }
    });

    // Sort by date
    const sortedMonths = Array.from(monthlyData.keys()).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    const datasets = [];

    if (this.selectedTestType() === 'all' || this.selectedTestType() === 'spiral') {
      const spiralAvgs = sortedMonths.map(month => {
        const scores = monthlyData.get(month)!.spiral;
        return scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) * 100 : 0;
      });

      if (spiralAvgs.some(v => v > 0)) {
        datasets.push({
          label: 'Espiral',
          data: spiralAvgs,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: '#3b82f6',
          borderWidth: 2,
        });
      }
    }

    if (this.selectedTestType() === 'all' || this.selectedTestType() === 'voice') {
      const voiceAvgs = sortedMonths.map(month => {
        const scores = monthlyData.get(month)!.voice;
        return scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) * 100 : 0;
      });

      if (voiceAvgs.some(v => v > 0)) {
        datasets.push({
          label: 'Voz',
          data: voiceAvgs,
          backgroundColor: 'rgba(168, 85, 247, 0.7)',
          borderColor: '#a855f7',
          borderWidth: 2,
        });
      }
    }

    this.barChartData = {
      labels: sortedMonths,
      datasets: datasets as any
    };
  }

  updateRadarChart(): void {
    const stats = this.computedStats();
    if (!stats || this.filteredChartData().length === 0) {
      this.radarChartData = {
        labels: ['Score Médio', 'Consistência', 'Frequência', 'Tendência', 'Qualidade'],
        datasets: []
      };
      return;
    }

    const data = this.filteredChartData();
    const spiralData = data.filter(d => d.type === 'spiral');
    const voiceData = data.filter(d => d.type === 'voice');

    const calculateMetrics = (tests: ChartDataPoint[]) => {
      if (tests.length === 0) return null;

      const scores = tests.map(t => t.score);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      // Consistência: Inverso do desvio padrão normalizado
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
      const stdDev = Math.sqrt(variance);
      const consistency = Math.max(0, 100 - (stdDev * 10));

      // Frequência: baseada no número de testes
      const frequency = Math.min(100, (tests.length / 10) * 100);

      // Tendência: baseada na progressão
      const firstHalf = tests.slice(0, Math.floor(tests.length / 2));
      const secondHalf = tests.slice(Math.floor(tests.length / 2));
      const avgFirst = firstHalf.reduce((sum, t) => sum + t.score, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((sum, t) => sum + t.score, 0) / secondHalf.length;
      const trend = avgSecond >= avgFirst ? 100 : Math.max(0, 100 - Math.abs(((avgFirst - avgSecond) / avgFirst) * 100));

      // Qualidade: baseada no score médio normalizado
      const quality = Math.min(100, avgScore * 100);

      return {
        scoreNorm: Math.min(100, avgScore * 100),
        consistency,
        frequency,
        trend,
        quality
      };
    };

    const datasets = [];

    if ((this.selectedTestType() === 'all' || this.selectedTestType() === 'spiral') && spiralData.length > 0) {
      const metrics = calculateMetrics(spiralData);
      if (metrics) {
        datasets.push({
          label: 'Espiral',
          data: [metrics.scoreNorm, metrics.consistency, metrics.frequency, metrics.trend, metrics.quality],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#3b82f6',
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#3b82f6',
          borderWidth: 2,
        });
      }
    }

    if ((this.selectedTestType() === 'all' || this.selectedTestType() === 'voice') && voiceData.length > 0) {
      const metrics = calculateMetrics(voiceData);
      if (metrics) {
        datasets.push({
          label: 'Voz',
          data: [metrics.scoreNorm, metrics.consistency, metrics.frequency, metrics.trend, metrics.quality],
          backgroundColor: 'rgba(168, 85, 247, 0.2)',
          borderColor: '#a855f7',
          pointBackgroundColor: '#a855f7',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#a855f7',
          borderWidth: 2,
        });
      }
    }

    this.radarChartData = {
      labels: ['Score Médio', 'Consistência', 'Frequência', 'Tendência', 'Qualidade'],
      datasets: datasets as any
    };
  }

  getTrendIcon(): string {
    const stats = this.computedStats();
    if (!stats) return '';

    switch (stats.trend) {
      case 'improving':
        return '↗';
      case 'declining':
        return '↘';
      default:
        return '→';
    }
  }

  getTrendColor(): string {
    const stats = this.computedStats();
    if (!stats) return 'text-gray-600';

    switch (stats.trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  getTrendLabel(): string {
    const stats = this.computedStats();
    if (!stats) return '';

    switch (stats.trend) {
      case 'improving':
        return 'Melhorando';
      case 'declining':
        return 'Piorando';
      default:
        return 'Estável';
    }
  }

  clearFilters(): void {
    this.selectedTestType.set('all');
  }

  getTestTypeLabel(type: 'all' | 'spiral' | 'voice'): string {
    const labels: Record<'all' | 'spiral' | 'voice', string> = {
      all: 'Todos os testes',
      spiral: 'Teste de Espiral',
      voice: 'Teste de Voz'
    };
    return labels[type];
  }
}
