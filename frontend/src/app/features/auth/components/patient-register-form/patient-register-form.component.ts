import {
  Component,
  EventEmitter,
  Input,
  Output,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-patient-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './patient-register-form.component.html',
})
export class PatientRegisterFormComponent {
  @Input() patientForm!: FormGroup;
  @Input() isLoading = false;
  @Input() apiError: string | null = null;
  @ViewChild('apiErrorDiv') apiErrorDiv: ElementRef | undefined;
  buttonTouched = false;

  currentStep = 1;
  totalSteps = 3;

  showPassword = false;
  showConfirmPassword = false;

  @Output() formSubmit = new EventEmitter<void>();

  nextStep(): void {
    if (this.validateCurrentStep()) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.buttonTouched = true;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  validateCurrentStep(): boolean {
    const fieldsToValidate = this.getFieldsForCurrentStep();
    let isValid = true;

    fieldsToValidate.forEach((fieldName) => {
      const control = this.patientForm.get(fieldName);
      if (control) {
        control.markAsTouched();
        if (control.invalid) {
          isValid = false;
        }
      }
    });

    return isValid;
  }

  getFieldsForCurrentStep(): string[] {
    switch (this.currentStep) {
      case 1:
        return ['name', 'cpf', 'birthdate', 'gender'];
      case 2:
        return ['cep', 'street', 'number', 'neighborhood', 'city', 'state'];
      case 3:
        return ['email', 'password', 'confirmPassword'];
      default:
        return [];
    }
  }

  onSubmit(): void {
    if (this.validateCurrentStep()) {
      this.formSubmit.emit();
      this.scrollToError();
    } else {
      this.buttonTouched = true;
    }
  }

  scrollToError() {
    setTimeout(() => {
      if (this.apiErrorDiv) {
        this.apiErrorDiv.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 100);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
