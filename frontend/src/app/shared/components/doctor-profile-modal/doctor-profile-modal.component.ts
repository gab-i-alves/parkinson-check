import {
  Component,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Doctor } from '../../../core/models/doctor.model';
import { BadgeComponent } from '../badge/badge.component';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { CpfPipe } from '../../pipes/cpf.pipe';

// Generic profile data that can represent either a doctor or a patient
export interface ProfileData {
  id: number | string;
  name: string;
  // Doctor-specific fields
  expertise_area?: string;
  crm?: string;
  location?: string;
  // Patient-specific fields
  cpf?: string;
  age?: number;
  email?: string;
}

@Component({
  selector: 'app-doctor-profile-modal',
  standalone: true,
  imports: [CommonModule, BadgeComponent, TooltipDirective, FormsModule, CpfPipe],
  templateUrl: './doctor-profile-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorProfileModalComponent {
  // Modern signals API - now accepts generic ProfileData
  doctor = input<ProfileData | null>(null);
  isVisible = input<boolean>(false);
  showMessageField = input<boolean>(false);
  close = output<void>();
  requestLink = output<{ doctorId: number | string; message?: string }>();

  // Loading state for async actions
  isRequesting = signal<boolean>(false);

  // Message for binding request (only used when showMessageField is true)
  requestMessage = signal<string>('');

  onClose(): void {
    this.close.emit();
  }

  onRequestLink(): void {
    const currentProfile = this.doctor();
    if (currentProfile && !this.isRequesting()) {
      this.isRequesting.set(true);
      this.requestLink.emit({
        doctorId: currentProfile.id,
        message: this.requestMessage() || undefined
      });
      // Reset loading state and message after a delay (parent should handle actual state)
      setTimeout(() => {
        this.isRequesting.set(false);
        this.requestMessage.set('');
      }, 1000);
    }
  }

  // Get initials for avatar
  getInitials(): string {
    const currentProfile = this.doctor();
    if (!currentProfile?.name) return '?';

    const names = currentProfile.name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  // Check if profile is a doctor (has expertise_area)
  isDoctor(): boolean {
    return !!this.doctor()?.expertise_area;
  }

  // Check if profile is a patient (has cpf or email)
  isPatient(): boolean {
    const profile = this.doctor();
    return !!(profile?.cpf || (profile?.email && !profile?.expertise_area));
  }
}
