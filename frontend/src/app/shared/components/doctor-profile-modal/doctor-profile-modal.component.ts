import {
  Component,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Doctor } from '../../../core/models/doctor.model';
import { BadgeComponent } from '../badge/badge.component';
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
  selector: 'app-doctor-profile-modal',
  standalone: true,
  imports: [CommonModule, BadgeComponent, TooltipDirective],
  templateUrl: './doctor-profile-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorProfileModalComponent {
  // Modern signals API
  doctor = input<Doctor | null>(null);
  isVisible = input<boolean>(false);
  close = output<void>();
  requestLink = output<number>();

  // Loading state for async actions
  isRequesting = signal<boolean>(false);

  onClose(): void {
    this.close.emit();
  }

  onRequestLink(): void {
    const currentDoctor = this.doctor();
    if (currentDoctor && !this.isRequesting()) {
      this.isRequesting.set(true);
      this.requestLink.emit(currentDoctor.id);
      // Reset loading state after a delay (parent should handle actual state)
      setTimeout(() => this.isRequesting.set(false), 1000);
    }
  }

  // Get initials for avatar
  getInitials(): string {
    const currentDoctor = this.doctor();
    if (!currentDoctor?.name) return '?';

    const names = currentDoctor.name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  // Get status badge variant
  getStatusBadgeVariant(): 'success' | 'warning' | 'neutral' {
    const status = this.doctor()?.status;
    if (status === 'linked') return 'success';
    if (status === 'pending') return 'warning';
    return 'neutral';
  }

  // Get status text
  getStatusText(): string {
    const status = this.doctor()?.status;
    if (status === 'linked') return 'Vinculado';
    if (status === 'pending') return 'Pendente';
    return 'Não Vinculado';
  }
}
