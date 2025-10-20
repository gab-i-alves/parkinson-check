import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-clinical-test-type-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clinical-test-type-selection.component.html',
})
export class ClinicalTestTypeSelectionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly patientId = signal<number | null>(null);
  readonly patientName = signal<string>('Paciente'); // TODO: Buscar nome do paciente da API

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('patientId');
    if (id) {
      this.patientId.set(Number(id));
      // TODO: Carregar dados do paciente
    }
  }

  selectSpiralTest(): void {
    const patientId = this.patientId();
    if (patientId) {
      this.router.navigate(['/dashboard/clinical-test/spiral', patientId]);
    }
  }

  selectVoiceTest(): void {
    const patientId = this.patientId();
    if (patientId) {
      this.router.navigate(['/dashboard/clinical-test/voice', patientId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/clinical-test/patient-selection']);
  }
}
