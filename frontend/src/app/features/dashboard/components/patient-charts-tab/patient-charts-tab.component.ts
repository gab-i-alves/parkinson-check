import { Component, Input, OnChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientTimeline } from '../../../../core/models/patient-timeline.model';
import { PatientStatistics } from '../../../../core/models/patient-statistics.model';

interface ChartDataPoint {
  date: string;
  score: number;
  type: 'spiral' | 'voice';
  classification: string;
}

@Component({
  selector: 'app-patient-charts-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-charts-tab.component.html',
})
export class PatientChartsTabComponent implements OnChanges {
  @Input() timeline: PatientTimeline | null = null;
  @Input() statistics: PatientStatistics | null = null;

  readonly chartData = signal<ChartDataPoint[]>([]);
  readonly selectedTestType = signal<'all' | 'spiral' | 'voice'>('all');

  readonly filteredChartData = computed(() => {
    if (this.selectedTestType() === 'all') {
      return this.chartData();
    }
    return this.chartData().filter((d) => d.type === this.selectedTestType());
  });

  ngOnChanges(): void {
    this.processChartData();
  }

  processChartData(): void {
    if (!this.timeline) return;

    const data: ChartDataPoint[] = this.timeline.tests.map((test) => ({
      date: new Date(test.execution_date).toLocaleDateString('pt-BR'),
      score: test.score,
      type: test.test_type === 'SPIRAL_TEST' ? 'spiral' : 'voice',
      classification: test.classification,
    }));

    // Ordenar por data (mais antigo primeiro para gráfico)
    data.reverse();

    this.chartData.set(data);
  }

  getMaxScore(): number {
    const scores = this.filteredChartData().map((d) => d.score);
    return Math.max(...scores, 1);
  }

  getMinScore(): number {
    const scores = this.filteredChartData().map((d) => d.score);
    return Math.min(...scores, 0);
  }

  getScorePercentage(score: number): number {
    const max = this.getMaxScore();
    const min = this.getMinScore();
    return ((score - min) / (max - min)) * 100;
  }

  formatDate(dateString: string): string {
    return dateString;
  }
}
