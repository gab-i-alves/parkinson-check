import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { DoctorDashboardService } from '../../../services/doctor-dashboard.service';

type SpiralMethod = 'webcam' | 'paper';

@Component({
  selector: 'app-clinical-spiral-method-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clinical-spiral-method-selection.component.html',
})
export class ClinicalSpiralMethodSelectionComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private doctorDashboardService = inject(DoctorDashboardService);

  readonly patientId = signal<number | null>(null);
  readonly patientName = signal<string>('Carregando...');
  readonly selectedMethod = signal<SpiralMethod | null>(null);
  readonly isLoading = signal<boolean>(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('patientId');
    if (id) {
      this.patientId.set(Number(id));
      this.loadPatientName(Number(id));
    } else {
      console.error('Patient ID not found in route');
      this.isLoading.set(false);
      this.router.navigate(['/dashboard/doctor/patients']);
    }
  }

  private loadPatientName(patientId: number): void {
    this.doctorDashboardService.getPatientsPage(1, 100).subscribe({
      next: (result) => {
        const patient = result.patients.find((p) => +p.id === patientId);
        if (patient) {
          this.patientName.set(patient.name);
        } else {
          this.patientName.set('Paciente não encontrado');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar paciente:', err);
        this.patientName.set('Erro ao carregar nome');
        this.isLoading.set(false);
      },
    });
  }

  selectMethod(method: SpiralMethod): void {
    this.selectedMethod.set(method);
    this.proceedToTest(method);
  }

  private proceedToTest(method: SpiralMethod): void {
    const patientId = this.patientId();

    if (!patientId) {
      return;
    }

    if (method === 'webcam') {
      this.router.navigate(['/dashboard/tests/clinical/spiral', patientId]);
    } else if (method === 'paper') {
      this.router.navigate(['/dashboard/tests/clinical/spiral-paper', patientId]);
    }
  }

  goBack(): void {
    const patientId = this.patientId();
    if (patientId) {
      this.router.navigate(['/dashboard/doctor/clinical-test/type-selection', patientId]);
    }
  }
}
