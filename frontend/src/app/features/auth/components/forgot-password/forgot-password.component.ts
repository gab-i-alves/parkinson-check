import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.services';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { ForgotPasswordRequest } from '../../../../core/models/reset-password-request.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPassword {
  forgotPasswordForm!: FormGroup<{
    email: FormControl<string | null>;
  }>;

  isLoading = false;
  apiError: string | null = null;
  successMessage: string | null = null;

  buttonTouched = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.apiError = null;
    this.successMessage = null;
    this.isLoading = true;
    this.forgotPasswordForm.disable();

    let email = this.forgotPasswordForm.value.email!;
    const request: ForgotPasswordRequest = {
      email: this.forgotPasswordForm.value.email!,
    };

    console.log('Email:', email);

    this.authService.forgotPassword(request).subscribe({
      next: () => {
        console.log('Um email foi enviado para redefinição de senha.');
        this.successMessage = 'Um email foi enviado para redefinição de senha. Verifique sua caixa de entrada.';
      },
      error: (err: any) => {
        console.error('Erro ao enviar solicitação:', err);
        this.apiError = 'Um erro interno ocorreu, tente novamente';
        this.isLoading = false;
        this.forgotPasswordForm.enable();
      },
      complete: () => {
        this.isLoading = false;
        this.forgotPasswordForm.enable();
      },
    });
  }
}
