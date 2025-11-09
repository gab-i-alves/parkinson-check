import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStatistics } from '../../../../../core/models/patient-statistics.model';
import { formatDate, getTrendIcon, getTrendColor, getTrendLabel, formatScore } from '../../utils/display-helpers';

@Component({
  selector: 'app-statistics-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-statistics-tab.component.html',
})
export class StatisticsTabComponent {
  @Input() statistics: PatientStatistics | null = null;

  // Helper functions
  readonly formatDate = formatDate;
  readonly getTrendIcon = getTrendIcon;
  readonly getTrendColor = getTrendColor;
  readonly getTrendLabel = getTrendLabel;
  readonly formatScore = formatScore;

  formatDateOrNA(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return formatDate(dateString);
  }

  formatScoreOrNA(score: number | null): string {
    if (score === null) return 'N/A';
    return score.toFixed(2);
  }
}
