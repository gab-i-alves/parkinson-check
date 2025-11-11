import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DoctorDashboardService } from '../../../services/doctor-dashboard.service';
import { DoctorService } from '../../../services/doctor.service';
import { BindingService } from '../../../../../core/services/binding.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { CpfPipe } from '../../../../../shared/pipes/cpf.pipe';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { TooltipDirective } from '../../../../../shared/directives/tooltip.directive';
import {
  Patient,
  PatientFilters,
  PatientStatus,
  TestType,
} from '../../../../../core/models/patient.model';

@Component({
  selector: 'app-my-patients-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CpfPipe,
    ConfirmationModalComponent,
    BadgeComponent,
    TooltipDirective
  ],
  templateUrl: './my-patients-list.component.html',
})
export class MyPatientsListComponent implements OnInit {
  private dashboardService = inject(DoctorDashboardService);
  private doctorService = inject(DoctorService);
  private bindingService = inject(BindingService);
  private toastService = inject(ToastService);

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

  showUnlinkModal = signal<boolean>(false);
  patientToUnlink = signal<Patient | null>(null);

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

  getStatusLabel(status?: PatientStatus): string {
    if (!status) return 'N/A';
    const labels: Record<PatientStatus, string> = {
      stable: 'Estável',
      attention: 'Atenção',
      critical: 'Crítico',
    };
    return labels[status];
  }

  getStatusVariant(status: PatientStatus): 'success' | 'warning' | 'error' {
    const variants: Record<PatientStatus, 'success' | 'warning' | 'error'> = {
      stable: 'success',
      attention: 'warning',
      critical: 'error',
    };
    return variants[status];
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
      this.toastService.warning('ID de vínculo não encontrado');
      return;
    }

    this.patientToUnlink.set(patient);
    this.showUnlinkModal.set(true);
  }

  confirmUnlink(): void {
    const patient = this.patientToUnlink();
    if (!patient || !patient.bindingId) {
      return;
    }

    this.bindingService.unlinkBinding(patient.bindingId).subscribe({
      next: () => {
        this.toastService.success('Paciente desvinculado com sucesso');
        this.showUnlinkModal.set(false);
        this.patientToUnlink.set(null);
        this.loadPatients();
      },
      error: (err: any) => {
        this.toastService.error(
          err.error?.detail || 'Erro ao desvincular paciente. Tente novamente.'
        );
        this.showUnlinkModal.set(false);
        this.patientToUnlink.set(null);
      },
    });
  }

  cancelUnlink(): void {
    this.showUnlinkModal.set(false);
    this.patientToUnlink.set(null);
  }
}
