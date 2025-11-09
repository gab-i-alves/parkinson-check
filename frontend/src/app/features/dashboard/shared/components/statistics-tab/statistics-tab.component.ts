import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStatistics } from '../../../../../core/models/patient-statistics.model';

@Component({
  selector: 'app-statistics-tab',
  standalone: true,
  imports: [CommonModule],
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
    return score.toFixed(2);
  }
}
