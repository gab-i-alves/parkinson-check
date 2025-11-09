import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientFullProfile } from '../../../../../core/models/patient-full-profile.model';

@Component({
  selector: 'app-patient-profile-tab',
  standalone: true,
  imports: [CommonModule],
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
}
