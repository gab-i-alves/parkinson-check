import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-doctor-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgxMaskDirective],
  templateUrl: './doctor-register-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorRegisterFormComponent {
  doctorForm = input.required<FormGroup>();
  isLoading = input.required<boolean>();
  apiError = input.required<string | null>();

  formSubmit = output<void>();

  onSubmit(): void {
    this.formSubmit.emit();

    this.scrollToError()
  }

  scrollToError() {
    setTimeout(() => {
      if (this.apiErrorDiv) {
        this.apiErrorDiv.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100); 
  }
}
