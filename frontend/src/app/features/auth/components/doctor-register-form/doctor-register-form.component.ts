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
  selector: 'app-doctor-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './doctor-register-form.component.html',
})
export class DoctorRegisterFormComponent {
  // DECISÃO DE ARQUITETURA: Uso de @Input para receber dados do pai.
  // O componente não cria o seu próprio FormGroup, tornando-o "burro" e reutilizável.
  // Ele apenas exibe o estado que lhe é fornecido.
  @Input() doctorForm!: FormGroup;
  @Input() isLoading = false;
  @Input() apiError: string | null = null;
  @ViewChild('apiErrorDiv') apiErrorDiv: ElementRef | undefined;
  buttonTouched = false;

  // Multi-step state
  currentStep = 1;
  totalSteps = 4;

  // Password visibility
  showPassword = false;
  showConfirmPassword = false;

  // Specialty dropdown
  showSpecialtyDropdown = false;
  specialties = [
    { value: 'Neurologia', label: 'Neurologia', icon: '🧠' },
    { value: 'Geriatria', label: 'Geriatria', icon: '👴' },
    { value: 'Cardiologia', label: 'Cardiologia', icon: '❤️' },
    { value: 'Ortopedia', label: 'Ortopedia', icon: '🦴' },
    { value: 'Psiquiatria', label: 'Psiquiatria', icon: '🧘' },
    { value: 'Clínica Geral', label: 'Clínica Geral', icon: '👨‍⚕️' },
    { value: 'Outra', label: 'Outra', icon: '📋' }
  ];

  // CRM mask patterns
  crmMaskPatterns = {
    'S': { pattern: new RegExp('[A-Z]') }
  };

  // Document upload
  activeDocumentTab: 'crm-front' | 'crm-back' | 'proof' = 'crm-front';
  uploadedFiles: {
    [key: string]: File | null;
  } = {
    'crm-front': null,
    'crm-back': null,
    'proof': null
  };

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
      const control = this.doctorForm.get(fieldName);
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
      case 2: // Dados Profissionais
        return ['crm', 'expertise_area'];
      case 3: // Endereço
        return ['cep', 'street', 'number', 'neighborhood', 'city', 'state'];
      case 4: // Segurança & Documentação
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

  // Specialty dropdown methods
  toggleSpecialtyDropdown(): void {
    this.showSpecialtyDropdown = !this.showSpecialtyDropdown;
  }

  selectSpecialty(value: string): void {
    this.doctorForm.patchValue({ expertise_area: value });
    this.showSpecialtyDropdown = false;
  }

  // Document upload methods
  selectDocumentTab(tab: 'crm-front' | 'crm-back' | 'proof'): void {
    this.activeDocumentTab = tab;
  }

  getDocumentLabel(tab: string): string {
    const labels: { [key: string]: string } = {
      'crm-front': 'CRM Frente',
      'crm-back': 'CRM Verso',
      'proof': 'Comprovante'
    };
    return labels[tab] || '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Arquivo muito grande. O tamanho máximo é 5MB.');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Formato de arquivo inválido. Use JPG, PNG ou PDF.');
        return;
      }

      this.uploadedFiles[this.activeDocumentTab] = file;

      // Reset input
      input.value = '';
    }
  }

  removeFile(tab: string): void {
    this.uploadedFiles[tab] = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
