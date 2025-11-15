import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorDashboardService } from '../../../services/doctor-dashboard.service';
import { BreadcrumbService } from '../../../../../shared/services/breadcrumb.service';

@Component({
  selector: 'app-clinical-test-type-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clinical-test-type-selection.component.html',
})
export class ClinicalTestTypeSelectionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private doctorDashboardService = inject(DoctorDashboardService);
  private breadcrumbService = inject(BreadcrumbService);

  readonly patientId = signal<number | null>(null);
  readonly patientName = signal<string>('Carregando...');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('patientId');
    if (id) {
      this.patientId.set(Number(id));
      this.loadPatientName(Number(id));
    }
  }

  private loadPatientName(patientId: number): void {
    this.doctorDashboardService.getPatientsPage(1, 100).subscribe({
      next: (result) => {
        const patient = result.patients.find((p) => +p.id === patientId);
        if (patient) {
          this.patientName.set(patient.name);
          const currentUrl = this.router.url;
          this.breadcrumbService.updateBreadcrumb(currentUrl, patient.name);
        } else {
          this.patientName.set('Paciente não encontrado');
        }
      },
      error: (err) => {
        console.error('Erro ao carregar paciente:', err);
        this.patientName.set('Erro ao carregar nome');
      },
    });
  }

  selectSpiralTest(): void {
    const patientId = this.patientId();
    if (patientId) {
      this.router.navigate(['/dashboard/doctor/clinical-test/spiral-method-selection', patientId]);
    }
  }

  selectVoiceTest(): void {
    const patientId = this.patientId();
    if (patientId) {
      this.router.navigate(['/dashboard/tests/clinical/voice', patientId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/doctor/clinical-test/patient-selection']);
  }
}
