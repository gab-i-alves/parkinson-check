import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TimelineTestItem, TestType } from '../../../../core/models/patient-timeline.model';

@Component({
  selector: 'app-recent-tests-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recent-tests-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentTestsListComponent {
  tests = input.required<TimelineTestItem[]>();

  getTestTypeLabel(type: TestType): string {
    return type === 'SPIRAL_TEST' ? 'Espiral' : 'Voz';
  }

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
}
