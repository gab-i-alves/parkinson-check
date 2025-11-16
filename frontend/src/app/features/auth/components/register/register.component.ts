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
        crm: ['', [Validators.required]],
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

  onPatientSubmit(): void {
    if (this.patientRegisterForm.invalid) {
      this.patientRegisterForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.patientRegisterForm.disable();
    this.apiError = null;

    console.log(
      'Dados do Cadastro (Paciente):',
      this.patientRegisterForm.value
    );
    this.authService.registerPatient(this.patientRegisterForm.value).subscribe({
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

    console.log('Dados do Cadastro (Médico):', this.doctorRegisterForm.value);

    this.authService.registerDoctor(this.doctorRegisterForm.value).subscribe({
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
        this.apiError = err.error?.detail || 'Ocorreu um erro no cadastro.';
        this.isLoading = false;
        this.doctorRegisterForm.enable();
      },
    });
  }

  private uploadDoctorDocuments(doctorId: number): void {
    const uploadPromises = [];

    const crm_front = this.doctorFiles['crm-front'];
    if (crm_front) {
      uploadPromises.push(
        this.authService
          .sendDoctorDocumentation({ doctorId, crm_front })
          .toPromise()
      );
    }

    const crm_back = this.doctorFiles['crm-back'];
    if (this.doctorFiles['crm-back']) {
      uploadPromises.push(
        this.authService
          .sendDoctorDocumentation({ doctorId, crm_back })
          .toPromise()
      );
    }

    const proof = this.doctorFiles['proof'];
    if (this.doctorFiles['proof']) {
      uploadPromises.push(
        this.authService
          .sendDoctorDocumentation({ doctorId, crm_back })
          .toPromise()
      );
    }

    // Executar todos os uploads em paralelo
    Promise.all(uploadPromises)
      .then(() => {
        console.log('Todos os documentos foram enviados com sucesso!');
        
      })
      .catch((error) => {
        console.error('Erro ao enviar documentos:', error);
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
