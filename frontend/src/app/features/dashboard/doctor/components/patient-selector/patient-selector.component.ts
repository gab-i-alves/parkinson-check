import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DoctorDashboardService } from '../../../services/doctor-dashboard.service';
import { Patient } from '../../../../../core/models/patient.model';

@Component({
  selector: 'app-patient-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-selector.component.html',
})
export class PatientSelectorComponent {
  private doctorDashboardService = inject(DoctorDashboardService);
  private router = inject(Router);

  readonly searchQuery = signal<string>('');
  readonly patients = signal<Patient[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly selectedPatientId = signal<number | null>(null);

  readonly filteredPatients = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return this.patients();
    }
    return this.patients().filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.cpf?.toLowerCase().includes(query)
    );
  });

  readonly canProceed = computed(() => this.selectedPatientId() !== null);

  constructor() {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading.set(true);
    this.doctorDashboardService.getPatientsPage(1, 100).subscribe({
      next: (result) => {
        this.patients.set(result.patients);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar pacientes:', err);
        this.isLoading.set(false);
      },
    });
  }

  selectPatient(patientId: string): void {
    this.selectedPatientId.set(+patientId);
  }

  proceedToTestSelection(): void {
    const patientId = this.selectedPatientId();
    if (patientId) {
      this.router.navigate([
        '/dashboard/doctor/clinical-test/type-selection',
        patientId,
      ]);
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard/doctor']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  }

  formatTestType(testType?: string): string {
    if (!testType) return 'N/A';
    return testType === 'voice' ? 'Voz' : testType === 'spiral' ? 'Espiral' : testType;
  }
}
