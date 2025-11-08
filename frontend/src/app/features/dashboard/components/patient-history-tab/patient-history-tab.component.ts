import { Component, Input, OnChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PatientTimeline,
  TestType,
} from '../../../../core/models/patient-timeline.model';

type FilterType = 'all' | 'SPIRAL_TEST' | 'VOICE_TEST';
type FilterClassification = 'all' | 'HEALTHY' | 'PARKINSON';

@Component({
  selector: 'app-patient-history-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-history-tab.component.html',
})
export class PatientHistoryTabComponent implements OnChanges {
  @Input() timeline: PatientTimeline | null = null;
  @Input({ required: true }) patientId!: number;

  readonly filterType = signal<FilterType>('all');
  readonly filterClassification = signal<FilterClassification>('all');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);

  readonly Math = Math;

  constructor(private router: Router) {}

  readonly filteredTests = computed(() => {
    if (!this.timeline) return [];

    let tests = this.timeline.tests;

    // Filtrar por tipo
    if (this.filterType() !== 'all') {
      tests = tests.filter((t) => t.test_type === this.filterType());
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getTestTypeLabel(type: TestType): string {
    return type === 'SPIRAL_TEST' ? 'Espiral' : 'Voz';
  }

  getClassificationLabel(classification: string): string {
    return classification === 'HEALTHY' ? 'Saudável' : 'Parkinson';
  }

  getClassificationColor(classification: string): string {
    return classification === 'HEALTHY' ? 'text-green-600' : 'text-red-600';
  }

  getClassificationBgColor(classification: string): string {
    return classification === 'HEALTHY' ? 'bg-green-50' : 'bg-red-50';
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

  onFilterTypeChange(value: FilterType): void {
    this.filterType.set(value);
    this.currentPage.set(1);
  }

  onFilterClassificationChange(value: FilterClassification): void {
    this.filterClassification.set(value);
    this.currentPage.set(1);
  }

  viewTestDetails(testId: number): void {
    this.router.navigate(['/dashboard/test', testId]);
  }
}
