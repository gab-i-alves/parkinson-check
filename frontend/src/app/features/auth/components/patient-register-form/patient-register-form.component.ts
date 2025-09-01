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
  selector: 'app-patient-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgxMaskDirective],
  templateUrl: './patient-register-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientRegisterFormComponent {
  patientForm = input.required<FormGroup>();
  isLoading = input.required<boolean>();
  apiError = input.required<string | null>();

  formSubmit = output<void>();

  onSubmit(): void {
    this.formSubmit.emit();
  }
}
