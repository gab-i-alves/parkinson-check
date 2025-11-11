import { ChangeDetectionStrategy, Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

export interface ChartData {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}

@Component({
  selector: 'app-chart-card',
  imports: [CommonModule],
  templateUrl: './chart-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartCardComponent implements AfterViewInit, OnDestroy {
  @Input() title: string = '';
  @Input() chartType: 'pie' | 'bar' | 'line' = 'bar';
  @Input() data: ChartData | null = null;

  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  constructor() {
    // React to data changes
    effect(() => {
      if (this.data && this.chart) {
        this.updateChart();
      }
    });
  }

  ngAfterViewInit() {
    if (this.data) {
      this.createChart();
    }
  }

  private createChart() {
    if (!this.chartCanvas || !this.data) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: this.chartType,
      data: {
        labels: this.data.labels,
        datasets: this.data.datasets.map(ds => ({
          ...ds,
          borderWidth: this.chartType === 'line' ? 2 : 1,
          tension: 0.4,
          fill: this.chartType === 'line',
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: this.chartType !== 'pie',
            position: 'bottom',
          },
        },
        scales: this.chartType !== 'pie' ? {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        } : undefined
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart() {
    if (!this.chart || !this.data) return;

    this.chart.data.labels = this.data.labels;
    this.chart.data.datasets = this.data.datasets.map(ds => ({
      ...ds,
      borderWidth: this.chartType === 'line' ? 2 : 1,
      tension: 0.4,
      fill: this.chartType === 'line',
    }));
    this.chart.update();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
