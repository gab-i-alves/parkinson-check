import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { TooltipDirective } from '../../directives/tooltip.directive';

export type ChartColorTheme = 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'neutral';

interface ChartThemeConfig {
  background: string;
  border: string;
  accent: string;
  iconColor: string;
  pattern: string;
}

@Component({
  selector: 'app-dashboard-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, TooltipDirective],
  templateUrl: './dashboard-chart.html',
  styleUrl: './dashboard-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardChart {
  // Modern signals API
  title = input<string>('');
  chartData = input<ChartConfiguration['data']>({ datasets: [], labels: [] });
  chartOptions = input<ChartConfiguration['options']>({});
  chartType = input<ChartType>('bar');
  height = input<string>('300px');
  colorTheme = input<ChartColorTheme>('neutral');
  description = input<string>('');
  isLoading = input<boolean>(false);
  showExportButton = input<boolean>(true);

  // Computed: Check if chart has data
  hasData = computed(() => {
    const data = this.chartData();
    return data.datasets && data.datasets.length > 0 &&
           data.datasets.some(ds => ds.data && ds.data.length > 0);
  });

  // Theme configurations following Intelly Design Guide
  private readonly themeConfigs: Record<ChartColorTheme, ChartThemeConfig> = {
    yellow: {
      background: 'bg-yellow-50',
      border: 'border-yellow-200',
      accent: 'text-yellow-600',
      iconColor: 'text-yellow-500',
      pattern: 'pattern-dots pattern-yellow-200 pattern-bg-yellow-50 pattern-size-4 pattern-opacity-40'
    },
    pink: {
      background: 'bg-pink-50',
      border: 'border-pink-200',
      accent: 'text-pink-600',
      iconColor: 'text-pink-500',
      pattern: 'pattern-dots pattern-pink-200 pattern-bg-pink-50 pattern-size-4 pattern-opacity-40'
    },
    blue: {
      background: 'bg-blue-50',
      border: 'border-blue-200',
      accent: 'text-blue-600',
      iconColor: 'text-blue-500',
      pattern: 'pattern-dots pattern-blue-200 pattern-bg-blue-50 pattern-size-4 pattern-opacity-40'
    },
    green: {
      background: 'bg-green-50',
      border: 'border-green-200',
      accent: 'text-green-600',
      iconColor: 'text-green-500',
      pattern: 'pattern-dots pattern-green-200 pattern-bg-green-50 pattern-size-4 pattern-opacity-40'
    },
    purple: {
      background: 'bg-purple-50',
      border: 'border-purple-200',
      accent: 'text-purple-600',
      iconColor: 'text-purple-500',
      pattern: 'pattern-dots pattern-purple-200 pattern-bg-purple-50 pattern-size-4 pattern-opacity-40'
    },
    neutral: {
      background: 'bg-neutral-50',
      border: 'border-neutral-200',
      accent: 'text-neutral-700',
      iconColor: 'text-neutral-500',
      pattern: 'pattern-dots pattern-neutral-200 pattern-bg-neutral-50 pattern-size-4 pattern-opacity-40'
    }
  };

  get themeConfig(): ChartThemeConfig {
    return this.themeConfigs[this.colorTheme()];
  }

  onExport(): void {
    // TODO: Implement export functionality
    console.log('Export chart:', this.title());
  }
}
