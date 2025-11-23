import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import { PatientRegisterFormComponent } from '../patient-register-form/patient-register-form.component';
import { DoctorRegisterFormComponent } from '../doctor-register-form/doctor-register-form.component';
import { CepService } from '../../../../core/services/cep.services';
import { HttpErrorResponse } from '@angular/common/http';
import {
  matchPasswordValidator,
  cpfValidator,
  strongPasswordValidator,
  crmValidator,
} from '../../../../core/validators/custom-validators';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
  tap,
} from 'rxjs/operators';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    PatientRegisterFormComponent,
    DoctorRegisterFormComponent,
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  activeTab: 'paciente' | 'medico' = 'paciente';

  patientRegisterForm!: FormGroup;
  doctorRegisterForm!: FormGroup;
  isLoading = false;
  apiError: string | null = null;

  doctorFiles: { [key: string]: File | null } = {
    'crm-front': null,
    'crm-back': null,
    proof: null,
  };

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cepService: CepService
  ) {}

  ngOnInit(): void {
    this.patientRegisterForm = this.formBuilder.group(
      {
        // Dados pessoais
        name: ['', [Validators.required, Validators.minLength(3)]],
        cpf: ['', [Validators.required, cpfValidator()]],
        birthdate: ['', [Validators.required]],
        gender: ['', [Validators.required]],

        // Endereço
        cep: ['', [Validators.required]],
        street: ['', [Validators.required]],
        number: ['', [Validators.required]],
        complement: [''], // Opcional
        neighborhood: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],

        // Segurança
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            strongPasswordValidator(),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: matchPasswordValidator('password', 'confirmPassword'),
      }
    );

    this.doctorRegisterForm = this.formBuilder.group(
      {
        // Dados profissionais
        name: ['', [Validators.required, Validators.minLength(3)]],
        cpf: ['', [Validators.required, cpfValidator()]],
        birthdate: ['', [Validators.required]],
        gender: ['', [Validators.required]],
        crm: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(10),
            crmValidator(),
          ],
        ],
        expertise_area: ['', [Validators.required]],

        // Endereço
        cep: ['', [Validators.required]],
        street: ['', [Validators.required]],
        number: ['', [Validators.required]],
        complement: [''], // Opcional
        neighborhood: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],

        // Seção Documentação (será tratada separadamente)

        // Segurança
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            strongPasswordValidator(),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: matchPasswordValidator('password', 'confirmPassword'), // Aplicar ao grupo
      }
    );

    this.setupCepListener(this.patientRegisterForm);
    this.setupCepListener(this.doctorRegisterForm);
  }

  selectTab(tab: 'paciente' | 'medico'): void {
    this.activeTab = tab;
    this.apiError = null;
  }

  private cleanFormData(formData: any): any {
    const cleanedData = { ...formData };

    // Remove confirmPassword (not needed in backend)
    delete cleanedData.confirmPassword;

    // Convert gender to number (backend expects 1, 2, or 3)
    if (cleanedData.gender) {
      cleanedData.gender = parseInt(cleanedData.gender, 10);
    }

    // Remove formatting from CPF (dots and dashes)
    if (cleanedData.cpf) {
      cleanedData.cpf = cleanedData.cpf.replace(/[^\d]/g, '');
    }

    // Remove formatting from CEP (dash)
    if (cleanedData.cep) {
      cleanedData.cep = cleanedData.cep.replace(/[^\d]/g, '');
    }

    // Clean CRM (trim and uppercase)
    if (cleanedData.crm) {
      cleanedData.crm = cleanedData.crm.trim().toUpperCase();
    }

    return cleanedData;
  }

  onPatientSubmit(): void {
    if (this.patientRegisterForm.invalid) {
      this.patientRegisterForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.patientRegisterForm.disable();
    this.apiError = null;

    const cleanedData = this.cleanFormData(this.patientRegisterForm.value);
    console.log(
      'Dados do Cadastro (Paciente):',
      cleanedData
    );
    this.authService.registerPatient(cleanedData).subscribe({
      next: (response: any) => {
        console.log('Cadastro de paciente bem-sucedido!', response);
        this.router.navigate(['/auth/login']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro no cadastro:', err);
        this.apiError = err.error?.detail || 'Ocorreu um erro no cadastro.';
        this.isLoading = false;
        this.patientRegisterForm.enable();
      },
    });
  }

  onDoctorFilesChange(files: { [key: string]: File | null }): void {
    this.doctorFiles = { ...files };
    console.log('Arquivos recebidos do filho:', this.doctorFiles);
  }

  onDoctorSubmit(): void {
    if (this.doctorRegisterForm.invalid) {
      this.doctorRegisterForm.markAllAsTouched();
      return;
    }

    if (
      !this.doctorFiles['crm-front'] ||
      !this.doctorFiles['crm-back'] ||
      !this.doctorFiles['proof']
    ) {
      this.apiError =
        'Por favor, faça upload de todos os documentos obrigatórios.';
      return;
    }

    this.isLoading = true;
    this.doctorRegisterForm.disable();
    this.apiError = null;

    const cleanedData = this.cleanFormData(this.doctorRegisterForm.value);
    console.log('Dados do Cadastro (Médico):', cleanedData);

    this.authService.registerDoctor(cleanedData).subscribe({
      next: (response: any) => {
        console.log('Cadastro de médico enviado para aprovação!', response);

        this.uploadDoctorDocuments(response.id);

        this.router.navigate(['/auth/login'], {
          state: {
            message:
              'Cadastro realizado! Você será notificado por e-mail após a aprovação.',
          },
        });
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro no cadastro do médico:', err);
        console.error('=== DETALHES COMPLETOS DO ERRO 422 ===');
        console.error('Status:', err.status);
        console.error('Error object:', err.error);
        console.error('Error detail:', err.error?.detail);
        console.error('Validation errors:', JSON.stringify(err.error, null, 2));
        console.error('=====================================');
        this.apiError = err.error?.detail || 'Ocorreu um erro no cadastro.';
        this.isLoading = false;
        this.doctorRegisterForm.enable();
      },
    });
  }

  private uploadDoctorDocuments(doctorId: number): void {
    const uploadPromises: Promise<any>[] = [];

    // Map frontend file keys to backend DocumentType enum values
    const fileTypeMapping: { [key: string]: string } = {
      'crm-front': 'crm_certificate',
      'crm-back': 'diploma',
      'proof': 'proof_of_address'
    };

    // Upload each file with the correct document_type using the public registration endpoint
    Object.keys(this.doctorFiles).forEach((fileKey) => {
      const file = this.doctorFiles[fileKey];
      if (file) {
        const formData = new FormData();
        formData.append('document_type', fileTypeMapping[fileKey]);
        formData.append('file', file);

        console.log(`[Register] Uploading ${fileKey} (${fileTypeMapping[fileKey]}) for doctor ID ${doctorId}:`, file.name);

        uploadPromises.push(
          this.authService
            .sendRegistrationDocumentation(doctorId, formData)
            .toPromise()
        );
      }
    });

    // Execute all uploads in parallel
    Promise.all(uploadPromises)
      .then(() => {
        console.log('[Register] All documents uploaded successfully!');
      })
      .catch((error) => {
        console.error('[Register] Error uploading documents:', error);
        this.apiError =
          'Cadastro criado, mas houve erro no envio dos documentos. Entre em contato com o suporte.';
      })
      .finally(() => {
        this.isLoading = false;
        this.doctorRegisterForm.enable();
      });
  }

  private setupCepListener(form: FormGroup): void {
    // DECISÃO DE ARQUITETURA: Abordagem reativa para ouvir o campo CEP.
    form
      .get('cep')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter((cep: string) => cep?.length === 8),
        switchMap((cep: string) => this.cepService.search(cep)),
        tap((address) => {
          if (address) {
            form.patchValue({
              street: address.logradouro,
              neighborhood: address.bairro,
              city: address.localidade,
              state: address.uf,
            });
          }
        })
      )
      .subscribe();
  }
}
