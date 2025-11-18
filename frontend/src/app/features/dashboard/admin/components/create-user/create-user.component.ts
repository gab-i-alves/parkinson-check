import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserManagementService } from '../../../services/user-management.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../../shared/services/toast.service';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './create-user.component.html',
})
export class CreateUserComponent implements OnInit {
  createForm!: FormGroup;
  isLoading = false;
  apiError: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private userManagementService: UserManagementService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.createForm = this.formBuilder.group({
      userType: ['1', [Validators.required]], // Default: Paciente
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      birthdate: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      cep: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      street: ['', [Validators.required]],
      number: ['', [Validators.required]],
      complement: [''],
      neighborhood: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required, Validators.maxLength(2)]],
      // Campos específicos de médico (opcionais inicialmente)
      crm: [''],
      expertise_area: ['']
    });

    // Observar mudanças no tipo de usuário para ajustar validações
    this.createForm.get('userType')?.valueChanges.subscribe(value => {
      const crmControl = this.createForm.get('crm');
      const expertiseControl = this.createForm.get('expertise_area');

      if (value === '2') { // Médico
        crmControl?.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(10)]);
        expertiseControl?.setValidators([Validators.required]);
      } else {
        crmControl?.clearValidators();
        expertiseControl?.clearValidators();
      }

      crmControl?.updateValueAndValidity();
      expertiseControl?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.toastService.error('Por favor, preencha todos os campos obrigatórios corretamente');
      return;
    }

    this.isLoading = true;
    this.createForm.disable();
    this.apiError = null;

    this.userManagementService
      .createUser(this.createForm.value)
      .subscribe({
        next: (response: any) => {
          console.log('Usuário criado com sucesso:', response);
          this.toastService.success('Usuário criado com sucesso');
          this.router.navigate(['/dashboard/admin/users']);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erro ao criar usuário:', err);
          const errorMessage = err.error?.detail || 'Ocorreu um erro ao criar o usuário.';
          this.apiError = errorMessage;
          this.toastService.error(errorMessage);
          this.isLoading = false;
          this.createForm.enable();
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/admin/users']);
  }
}
