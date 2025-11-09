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
        '/dashboard/clinical-test/type-selection',
        patientId,
      ]);
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard/doctor']);
  }
}
