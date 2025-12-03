import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStatistics } from '../../../../../core/models/patient-statistics.model';
import { TooltipDirective } from '../../../../../shared/directives/tooltip.directive';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-statistics-tab',
  standalone: true,
  imports: [CommonModule, TooltipDirective, BadgeComponent],
  templateUrl: './statistics-tab.component.html',
})
export class StatisticsTabComponent {
  @Input() statistics: PatientStatistics | null = null;

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
    return (score * 100).toFixed(1);
  }

  getDaysBadgeVariant(days: number): 'success' | 'warning' | 'error' | 'neutral' {
    if (days <= 7) return 'success';
    if (days <= 30) return 'warning';
    return 'error';
  }
}
