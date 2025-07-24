import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import { PatientRegisterFormComponent } from '../patient-register-form/patient-register-form.component';
import { DoctorRegisterFormComponent } from '../doctor-register-form/doctor-register-form.component';
import { CepService } from '../../../../core/services/cep.services';
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

type RegisterRole = 'paciente' | 'medico'; // Admin não tem opção de cadastro através de formulário

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
  activeTab: RegisterRole = 'paciente';

  patientRegisterForm!: FormGroup;
  doctorRegisterForm!: FormGroup;
  isLoading = false;
  apiError: string | null = null;

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
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        cpf: ['', [Validators.required, cpfValidator()]],
        birthDate: ['', [Validators.required]],

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
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        cpf: ['', [Validators.required, cpfValidator()]],
        birthDate: ['', [Validators.required]],
        crm: ['', [Validators.required]],
        specialty: ['', [Validators.required]],

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

  selectTab(role: RegisterRole): void {
    this.activeTab = role;
    this.apiError = null;

    if (role === 'paciente') {
      this.patientRegisterForm.reset();
    } else if (role === 'medico') {
      this.doctorRegisterForm.reset();
    }
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
      next: (response) => {
        console.log('Cadastro de paciente bem-sucedido!', response);
        // DECISÃO DE UX: Após o cadastro, redirecionar para o login
        // para que o usuário possa entrar com suas novas credenciais.
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Erro no cadastro:', err);
        if (err.status === 409) {
          // 409 Conflict (E-mail/CPF já existe)
          this.apiError = 'O e-mail ou CPF informado já está em uso.';
        } else {
          this.apiError =
            'Ocorreu um erro ao realizar o cadastro. Tente novamente.';
        }
        this.isLoading = false;
        this.patientRegisterForm.enable();
      },
    });
  }

  onDoctorSubmit(): void {
    if (this.doctorRegisterForm.invalid) {
      this.doctorRegisterForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.doctorRegisterForm.disable();
    this.apiError = null;

    console.log('Dados do Cadastro (Médico):', this.doctorRegisterForm.value);

    this.authService.registerDoctor(this.doctorRegisterForm.value).subscribe({
      next: (response) => {
        console.log('Cadastro de médico enviado para aprovação!', response);
        this.router.navigate(['/auth/login'], {
          state: {
            message:
              'Cadastro realizado! Você será notificado por e-mail após a aprovação.',
          },
        });
      },
      error: (err) => {
        console.error('Erro no cadastro do médico:', err);
        if (err.status === 409) {
          this.apiError = 'O e-mail, CPF ou CRM informado já está em uso.';
        } else {
          this.apiError =
            'Ocorreu um erro ao realizar o cadastro. Tente novamente.';
        }
        this.isLoading = false;
        this.doctorRegisterForm.enable();
      },
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
