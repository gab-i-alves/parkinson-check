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
import { RouterLink } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-patient-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './patient-register-form.component.html',
})
export class PatientRegisterFormComponent {
  // DECISÃO DE ARQUITETURA: Uso de @Input para receber dados do pai.
  // O componente não cria o seu próprio FormGroup, tornando-o "burro" e reutilizável.
  // Ele apenas exibe o estado que lhe é fornecido.
  @Input() patientForm!: FormGroup;
  @Input() isLoading = false;
  @Input() apiError: string | null = null;
  @ViewChild('apiErrorDiv') apiErrorDiv: ElementRef | undefined;
  buttonTouched = false;

  // Multi-step state
  currentStep = 1;
  totalSteps = 3;

  // Password visibility
  showPassword = false;
  showConfirmPassword = false;

  // DECISÃO DE ARQUITETURA: Uso de @Output para comunicar com o pai.
  // Em vez de conter a lógica de submissão, ele emite um evento.
  // Isso desacopla o componente da lógica de negócio (ex: chamadas de API).
  @Output() formSubmit = new EventEmitter<void>();

  // Navegação entre steps
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

  // Valida apenas os campos do step atual
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

  // Retorna os campos que devem ser validados no step atual
  getFieldsForCurrentStep(): string[] {
    switch (this.currentStep) {
      case 1: // Dados Pessoais
        return ['name', 'cpf', 'birthdate', 'gender'];
      case 2: // Endereço
        return ['cep', 'street', 'number', 'neighborhood', 'city', 'state'];
      case 3: // Segurança
        return ['email', 'password', 'confirmPassword'];
      default:
        return [];
    }
  }

  // Propaga o evento de submissão para o componente pai.
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
