import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TimelineTestItem, TestType } from '../../../../../core/models/patient-timeline.model';
import { getTestTypeLabel } from '../../utils/display-helpers';
import { TooltipDirective } from '../../../../../shared/directives/tooltip.directive';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-recent-tests-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TooltipDirective, BadgeComponent],
  templateUrl: './recent-tests-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentTestsListComponent {
  tests = input.required<TimelineTestItem[]>();

  // Use shared helper that handles both numeric and string values
  readonly getTestTypeLabel = getTestTypeLabel;

  getClassificationLabel(classification: string): string {
    return classification === 'HEALTHY' ? 'Saudável' : 'Parkinson';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  getClassificationColor(classification: string): string {
    return classification === 'HEALTHY'
      ? 'text-green-600 bg-green-50'
      : 'text-red-600 bg-red-50';
  }

  getClassificationBadgeVariant(classification: string): 'success' | 'error' | 'neutral' {
    if (classification === 'HEALTHY') return 'success';
    if (classification === 'PARKINSON') return 'error';
    return 'neutral';
  }

  isSpiralTest(testType: any): boolean {
    return testType === 'SPIRAL_TEST' || testType === 1;
  }
}
