import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DoctorDashboardService } from '../../../services/doctor-dashboard.service';
import { DoctorService } from '../../../services/doctor.service';
import { BindingService } from '../../../../../core/services/binding.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { CpfPipe } from '../../../../../shared/pipes/cpf.pipe';
import {
  Patient,
  PatientFilters,
  PatientStatus,
  TestType,
} from '../../../../../core/models/patient.model';

@Component({
  selector: 'app-my-patients-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CpfPipe],
  templateUrl: './my-patients-list.component.html',
})
export class MyPatientsListComponent implements OnInit {
  private dashboardService = inject(DoctorDashboardService);
  private doctorService = inject(DoctorService);
  private bindingService = inject(BindingService);
  private notificationService = inject(NotificationService);

  patients = signal<Patient[]>([]);
  isLoading = signal<boolean>(false);
  searchQuery = signal<string>('');
  selectedStatus = signal<PatientStatus | ''>('');
  selectedTestType = signal<TestType | ''>('');
  sortBy = signal<'name' | 'age' | 'lastTestDate'>('name');
  sortOrder = signal<'asc' | 'desc'>('asc');

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalPages = signal<number>(1);
  totalPatients = signal<number>(0);

  pageSizeOptions = [10, 25, 50];

  readonly Math = Math;

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading.set(true);

    const filters: PatientFilters = {
      searchQuery: this.searchQuery() || undefined,
      status: this.selectedStatus() || undefined,
      testType: this.selectedTestType() || undefined,
    };

    this.dashboardService
      .getPatientsPage(this.currentPage(), this.pageSize(), filters)
      .subscribe({
        next: (result) => {
          const sortedPatients = this.sortPatients(result.patients);
          this.patients.set(sortedPatients);
          this.totalPages.set(result.totalPages);
          this.totalPatients.set(result.total);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  sortPatients(patients: Patient[]): Patient[] {
    const sorted = [...patients];
    const order = this.sortOrder() === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy()) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'age':
          comparison = a.age - b.age;
          break;
        case 'lastTestDate':
          comparison = new Date(a.lastTestDate).getTime() - new Date(b.lastTestDate).getTime();
          break;
      }

      return comparison * order;
    });

    return sorted;
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'name' | 'age' | 'lastTestDate';
    this.sortBy.set(value);
    const sortedPatients = this.sortPatients(this.patients());
    this.patients.set(sortedPatients);
  }

  toggleSortOrder(): void {
    this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    const sortedPatients = this.sortPatients(this.patients());
    this.patients.set(sortedPatients);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadPatients();
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as
      | PatientStatus
      | '';
    this.selectedStatus.set(value);
    this.currentPage.set(1);
    this.loadPatients();
  }

  onTestTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as TestType | '';
    this.selectedTestType.set(value);
    this.currentPage.set(1);
    this.loadPatients();
  }

  onPageSizeChange(event: Event): void {
    const value = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageSize.set(value);
    this.currentPage.set(1);
    this.loadPatients();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadPatients();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('');
    this.selectedTestType.set('');
    this.currentPage.set(1);
    this.loadPatients();
  }

  getStatusLabel(status: PatientStatus): string {
    const labels: Record<PatientStatus, string> = {
      stable: 'Estável',
      attention: 'Atenção',
      critical: 'Crítico',
    };
    return labels[status];
  }

  getStatusClass(status: PatientStatus): string {
    const classes: Record<PatientStatus, string> = {
      stable: 'bg-green-100 text-green-800',
      attention: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
    };
    return classes[status];
  }

  getTestTypeLabel(testType?: TestType): string {
    if (!testType) return 'N/A';
    const labels: Record<TestType, string> = {
      spiral: 'Espiral',
      voice: 'Voz',
    };
    return labels[testType];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  unlinkPatient(patient: Patient): void {
    if (!patient.bindingId) {
      this.notificationService.warning('ID de vínculo não encontrado', 3000);
      return;
    }

    if (!confirm(`Tem certeza que deseja desvincular o paciente ${patient.name}?`)) {
      return;
    }

    this.bindingService.unlinkBinding(patient.bindingId).subscribe({
      next: () => {
        this.notificationService.success('Paciente desvinculado com sucesso', 3000);
        this.loadPatients();
      },
      error: (err: any) => {
        this.notificationService.error(
          `Erro ao desvincular paciente: ${err.error?.detail || 'Tente novamente'}`,
          5000
        );
      },
    });
  }
}
