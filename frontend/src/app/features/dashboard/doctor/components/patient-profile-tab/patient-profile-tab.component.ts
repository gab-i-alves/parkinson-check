import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientFullProfile } from '../../../../../core/models/patient-full-profile.model';
import { PatientStatus } from '../../../../../core/models/patient.model';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-patient-profile-tab',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './patient-profile-tab.component.html',
})
export class PatientProfileTabComponent {
  @Input({ required: true }) profile!: PatientFullProfile;

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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

  getStatusVariant(status?: PatientStatus): 'success' | 'warning' | 'error' | 'neutral' {
    if (!status) return 'neutral';
    const variants: Record<PatientStatus, 'success' | 'warning' | 'error'> = {
      stable: 'success',
      attention: 'warning',
      critical: 'error',
    };
    return variants[status];
  }
}
