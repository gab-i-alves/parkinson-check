import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Doctor } from '../../../features/dashboard/services/doctor.service';

@Component({
  selector: 'app-doctor-profile-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-profile-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorProfileModalComponent {
  @Input() doctor: Doctor | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() requestLink = new EventEmitter<number>();

  onClose(): void {
    this.close.emit();
  }

  onRequestLink(): void {
    if (this.doctor) {
      this.requestLink.emit(this.doctor.id);
    }
  }
}
