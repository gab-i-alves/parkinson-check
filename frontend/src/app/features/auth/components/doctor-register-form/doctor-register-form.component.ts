import {
  Component,
  EventEmitter,
  Input,
  Output,
  ElementRef,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-doctor-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective, FeedbackModalComponent],
  templateUrl: './doctor-register-form.component.html',
})
export class DoctorRegisterFormComponent {
  @Input() doctorForm!: FormGroup;
  @Input() isLoading = false;
  @Input() apiError: string | null = null;
  @ViewChild('apiErrorDiv') apiErrorDiv: ElementRef | undefined;
  buttonTouched = false;

  currentStep = 1;
  totalSteps = 4;

  showPassword = false;
  showConfirmPassword = false;

  showSpecialtyDropdown = false;
  specialties = [
    { value: 'Neurologia', label: 'Neurologia' },
    { value: 'Geriatria', label: 'Geriatria'},
    { value: 'Cardiologia', label: 'Cardiologia' },
    { value: 'Ortopedia', label: 'Ortopedia'},
    { value: 'Psiquiatria', label: 'Psiquiatria' },
    { value: 'Clínica Geral', label: 'Clínica Geral' },
    { value: 'Outra', label: 'Outra' },
  ];

  crmMaskPatterns = {
    'A': { pattern: /[A-Za-z]/ }
  };

  activeDocumentTab: 'crm' | 'diploma' | 'identity' | 'proof' = 'crm';
  uploadedFiles: {
    [key: string]: File | null;
  } = {
    crm: null,
    diploma: null,
    identity: null,
    proof: null,
  };

  @Output() formSubmit = new EventEmitter<void>();

  @Output() filesChange = new EventEmitter<{ [key: string]: File | null }>();

  constructor(private toastService: ToastService) {}

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

    console.log(`[Doctor Form] Validating step ${this.currentStep}:`, fieldsToValidate);

    fieldsToValidate.forEach((fieldName) => {
      const control = this.doctorForm.get(fieldName);
      if (control) {
        control.markAsTouched();
        if (control.invalid) {
          console.log(`[Doctor Form] Field "${fieldName}" is invalid:`, control.errors);
          isValid = false;
        }
      }
    });

    console.log(`[Doctor Form] Step ${this.currentStep} validation result:`, isValid);
    return isValid;
  }

  getFieldsForCurrentStep(): string[] {
    switch (this.currentStep) {
      case 1: 
        return ['name', 'cpf', 'birthdate', 'gender'];
      case 2: 
        return ['crm', 'expertise_area'];
      case 3: 
        return ['cep', 'street', 'number', 'neighborhood', 'city', 'state'];
      case 4: 
        return ['email', 'password', 'confirmPassword'];
      default:
        return [];
    }
  }

  onSubmit(): void {
    console.log('[Doctor Form] Submit button clicked');
    console.log('[Doctor Form] Current form state:', this.doctorForm.value);
    console.log('[Doctor Form] Form valid?', this.doctorForm.valid);
    console.log('[Doctor Form] Uploaded files:', this.uploadedFiles);

    if (this.validateCurrentStep()) {
      console.log('[Doctor Form] Validation passed, emitting formSubmit event');
      this.formSubmit.emit();
      this.scrollToError();
    } else {
      console.log('[Doctor Form] Validation failed, marking button as touched');
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

  toggleSpecialtyDropdown(): void {
    this.showSpecialtyDropdown = !this.showSpecialtyDropdown;
  }

  selectSpecialty(value: string): void {
    this.doctorForm.patchValue({ expertise_area: value });
    this.showSpecialtyDropdown = false;
  }

  selectDocumentTab(tab: 'crm' | 'diploma' | 'identity' | 'proof'): void {
    this.activeDocumentTab = tab;
  }

  getDocumentLabel(tab: string): string {
    const labels: { [key: string]: string } = {
      crm: 'CRM',
      diploma: 'Diploma Médico',
      identity: 'Identidade (RG ou CNH)',
      proof: 'Comprovante de Endereço',
    };
    return labels[tab] || '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log(`[Doctor Form] File selected for ${this.activeDocumentTab}:`, {
        name: file.name,
        size: file.size,
        type: file.type
      });

      if (file.size > 5 * 1024 * 1024) {
        this.toastService.error(
          'O tamanho máximo permitido é 5MB.',
          'Arquivo muito grande'
        );
        return;
      }

      const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
      ];
      if (!validTypes.includes(file.type)) {
        this.toastService.error(
          'Use apenas arquivos JPG, PNG ou PDF.',
          'Formato inválido'
        );
        return;
      }

      this.uploadedFiles[this.activeDocumentTab] = file;
      console.log('[Doctor Form] Updated uploaded files:', this.uploadedFiles);

      this.filesChange.emit(this.uploadedFiles);

      input.value = '';
    }
  }

  removeFile(tab: string): void {
    this.uploadedFiles[tab] = null;

    this.filesChange.emit(this.uploadedFiles);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  formatCrmInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    value = value.replace(/[^0-9A-Za-z]/g, '');

    if (value.length > 8) {
      value = value.substring(0, 8);
    }

    if (value.length > 6) {
      value = value.substring(0, 6) + '/' + value.substring(6);
    }

    value = value.toUpperCase();

    input.value = value;
    this.doctorForm.patchValue({ crm: value }, { emitEvent: false });
  }
}
