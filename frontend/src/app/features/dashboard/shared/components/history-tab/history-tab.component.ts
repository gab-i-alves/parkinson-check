import { Component, Input, OnChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PatientTimeline,
  TestType,
} from '../../../../../core/models/patient-timeline.model';
import { formatDate, getTestTypeLabel, getClassificationLabel, getClassificationColor, getClassificationBgColor } from '../../utils/display-helpers';
import { TooltipDirective } from '../../../../../shared/directives/tooltip.directive';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';

type FilterType = 'all' | 'SPIRAL_TEST' | 'VOICE_TEST';
type FilterClassification = 'all' | 'HEALTHY' | 'PARKINSON';

@Component({
  selector: 'app-history-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TooltipDirective, BadgeComponent],
  templateUrl: './history-tab.component.html',
})
export class HistoryTabComponent implements OnChanges {
  @Input() timeline: PatientTimeline | null = null;
  @Input({ required: true }) patientId!: number;
  @Input() isPatientView: boolean = false;

  readonly filterType = signal<FilterType>('all');
  readonly filterClassification = signal<FilterClassification>('all');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly pageSizeOptions = [10, 25, 50];

  readonly Math = Math;

  // Helper functions
  readonly formatDate = formatDate;
  readonly getTestTypeLabel = getTestTypeLabel;
  readonly getClassificationLabel = getClassificationLabel;
  readonly getClassificationColor = getClassificationColor;
  readonly getClassificationBgColor = getClassificationBgColor;

  constructor(private router: Router) {}

  readonly filteredTests = computed(() => {
    if (!this.timeline) return [];

    let tests = this.timeline.tests;

    // Filtrar por tipo
    if (this.filterType() !== 'all') {
      // Fix: Backend envia enum como número (1=SPIRAL, 2=VOICE)
      tests = tests.filter((t) => {
        const filterValue = this.filterType();
        return t.test_type === filterValue ||
               (filterValue === 'SPIRAL_TEST' && (t.test_type as any) === 1) ||
               (filterValue === 'VOICE_TEST' && (t.test_type as any) === 2);
      });
    }

    // Filtrar por classificação
    if (this.filterClassification() !== 'all') {
      tests = tests.filter(
        (t) => t.classification === this.filterClassification()
      );
    }

    return tests;
  });

  readonly paginatedTests = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredTests().slice(start, end);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredTests().length / this.pageSize());
  });

  ngOnChanges(): void {
    // Reset pagination when filters change
    this.currentPage.set(1);
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newSize = parseInt(target.value, 10);
    this.pageSize.set(newSize);
    this.currentPage.set(1);
  }

  onFilterTypeChange(value: FilterType): void {
    this.filterType.set(value);
    this.currentPage.set(1);
  }

  onFilterClassificationChange(value: FilterClassification): void {
    this.filterClassification.set(value);
    this.currentPage.set(1);
  }

  viewTestDetails(testId: number): void {
    const route = this.isPatientView
      ? ['/dashboard/my-test', testId]
      : ['/dashboard/doctor/test', testId];
    this.router.navigate(route);
  }

  isSpiralTest(testType: TestType | any): boolean {
    return testType === 'SPIRAL_TEST' || testType === 1;
  }

  isVoiceTest(testType: TestType | any): boolean {
    return testType === 'VOICE_TEST' || testType === 2;
  }

  clearFilters(): void {
    this.filterType.set('all');
    this.filterClassification.set('all');
    this.currentPage.set(1);
  }

  getClassificationBadgeVariant(classification: string): 'success' | 'error' | 'neutral' {
    if (classification === 'HEALTHY') return 'success';
    if (classification === 'PARKINSON') return 'error';
    return 'neutral';
  }

  formatDuration(test: any): string {
    if (this.isSpiralTest(test.test_type)) {
      return test.draw_duration ? `${test.draw_duration}s` : '-';
    } else if (this.isVoiceTest(test.test_type)) {
      return test.record_duration ? `${test.record_duration}s` : '-';
    }
    return '-';
  }

  getAverageScore(): string {
    if (!this.timeline || this.timeline.tests.length === 0) {
      return '0.00';
    }
    const sum = this.timeline.tests.reduce((acc, test) => acc + test.score, 0);
    const avg = sum / this.timeline.tests.length;
    return avg.toFixed(2);
  }
}
