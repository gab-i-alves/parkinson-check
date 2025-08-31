import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
  tap,
} from 'rxjs/operators';

import { AuthService } from '../../services/auth.services';
import { PatientRegisterFormComponent } from '../patient-register-form/patient-register-form.component';
import { DoctorRegisterFormComponent } from '../doctor-register-form/doctor-register-form.component';
import { CepService } from '../../../../core/services/cep.services';
import {
  matchPasswordValidator,
  cpfValidator,
  strongPasswordValidator,
} from '../../../../core/validators/custom-validators';

type RegisterRole = 'paciente' | 'medico';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly cepService = inject(CepService);
  private readonly router = inject(Router);

  readonly activeTab = signal<RegisterRole>('paciente');
  readonly isLoading = signal(false);
  readonly apiError = signal<string | null>(null);

  readonly patientRegisterForm: FormGroup;
  readonly doctorRegisterForm: FormGroup;

  constructor() {
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

  selectTab(tab: RegisterRole): void {
    this.activeTab.set(tab);
    this.apiError.set(null);
  }

  onPatientSubmit(): void {
    if (this.patientRegisterForm.invalid) {
      this.patientRegisterForm.markAllAsTouched();
      return;
    }

    this.apiError.set(null);
    this.isLoading.set(true);
    this.patientRegisterForm.disable();

    this.authService.registerPatient(this.patientRegisterForm.value).subscribe({
      next: (response) => {
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Erro no cadastro:', err);
        if (err.status === 409) {
          this.apiError.set('O e-mail ou CPF informado já está em uso.');
        } else {
          this.apiError.set(
            'Ocorreu um erro ao realizar o cadastro. Tente novamente.'
          );
        }
        this.isLoading.set(false);
        this.patientRegisterForm.enable();
      },
    });
  }

  onDoctorSubmit(): void {
    if (this.doctorRegisterForm.invalid) {
      this.doctorRegisterForm.markAllAsTouched();
      return;
    }

    this.apiError.set(null);
    this.isLoading.set(true);
    this.doctorRegisterForm.disable();

    this.authService.registerDoctor(this.doctorRegisterForm.value).subscribe({
      next: (response) => {
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
          this.apiError.set('O e-mail, CPF ou CRM informado já está em uso.');
        } else {
          this.apiError.set(
            'Ocorreu um erro ao realizar o cadastro. Tente novamente.'
          );
        }
        this.isLoading.set(false);
        this.doctorRegisterForm.enable();
      },
    });
  }

  private setupCepListener(form: FormGroup): void {
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
