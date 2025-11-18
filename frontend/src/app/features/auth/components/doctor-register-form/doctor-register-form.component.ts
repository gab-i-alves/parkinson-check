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
import { RouterLink } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { FeedbackModalComponent } from '../../../../shared/components/feedback-modal/feedback-modal.component';

@Component({
  selector: 'app-doctor-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective, FeedbackModalComponent],
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

  // Feedback modal signals
  readonly showFeedbackModal = signal<boolean>(false);
  readonly feedbackType = signal<'error'>('error');
  readonly feedbackTitle = signal<string>('');
  readonly feedbackMessage = signal<string>('');

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
    { value: 'Outra', label: 'Outra', icon: '📋' },
  ];

  // CRM mask patterns
  crmMaskPatterns = {
    'A': { pattern: /[A-Za-z]/ }
  };

  // Document upload
  activeDocumentTab: 'crm-front' | 'crm-back' | 'proof' = 'crm-front';
  uploadedFiles: {
    [key: string]: File | null;
  } = {
    'crm-front': null,
    'crm-back': null,
    proof: null,
  };

  // DECISÃO DE ARQUITETURA: Uso de @Output para comunicar com o pai.
  // Em vez de conter a lógica de submissão, ele emite um evento.
  // Isso desacopla o componente da lógica de negócio (ex: chamadas de API).
  @Output() formSubmit = new EventEmitter<void>();

  @Output() filesChange = new EventEmitter<{ [key: string]: File | null }>();

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
      proof: 'Comprovante',
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

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.feedbackTitle.set('Arquivo muito grande');
        this.feedbackMessage.set('O tamanho máximo permitido é 5MB.');
        this.feedbackType.set('error');
        this.showFeedbackModal.set(true);
        return;
      }

      // Validate file type
      const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
      ];
      if (!validTypes.includes(file.type)) {
        this.feedbackTitle.set('Formato inválido');
        this.feedbackMessage.set('Use apenas arquivos JPG, PNG ou PDF.');
        this.feedbackType.set('error');
        this.showFeedbackModal.set(true);
        return;
      }

      this.uploadedFiles[this.activeDocumentTab] = file;
      console.log('[Doctor Form] Updated uploaded files:', this.uploadedFiles);

      this.filesChange.emit(this.uploadedFiles);

      // Reset input
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

  // Formata o CRM automaticamente enquanto o usuário digita
  formatCrmInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remove tudo exceto números e letras
    value = value.replace(/[^0-9A-Za-z]/g, '');

    // Limita a 8 caracteres (6 dígitos + 2 letras)
    if (value.length > 8) {
      value = value.substring(0, 8);
    }

    // Adiciona a barra após os primeiros 6 caracteres (se houver mais de 6)
    if (value.length > 6) {
      value = value.substring(0, 6) + '/' + value.substring(6);
    }

    // Converte para maiúsculas
    value = value.toUpperCase();

    // Atualiza o valor do input e do FormControl
    input.value = value;
    this.doctorForm.patchValue({ crm: value }, { emitEvent: false });
  }
}
