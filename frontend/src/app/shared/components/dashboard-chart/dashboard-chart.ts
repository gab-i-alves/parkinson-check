import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard-chart.html',
  styleUrl: './dashboard-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardChart {
  @Input() title: string = '';
  @Input() chartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  @Input() chartOptions: ChartConfiguration['options'] = {};
  @Input() chartType: ChartType = 'bar';
  @Input() height: string = '300px';
}
