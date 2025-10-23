import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.services';
import { strongPasswordValidator } from '../../../../core/validators/custom-validators';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ResetPasswordRequest } from '../../../../core/models/reset-password-request.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPassword {
  resetPasswordForm!: FormGroup<{
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
  }>;

  resetToken: string = '';
  isLoading = false;
  apiError: string | null = null;

  buttonTouched = false;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.resetPasswordForm = this.formBuilder.group({
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          strongPasswordValidator(),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    });

    const urlToken = this.route.snapshot.paramMap.get('token');
    if (urlToken) {
      this.resetToken = urlToken;
    } else {
      // Caso o token não seja encontrado na URL
      alert(
        'Token da solicitação não encontrado, solicite a redefinição de senha novamente'
      );
      this.router.navigate(['/auth/forgot-password']);
      console.error('Token de redefinição não encontrado na URL.');
    }
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.apiError = null;
    this.isLoading = true;
    this.resetPasswordForm.disable();

    let password = this.resetPasswordForm.value.password!;
    const request: ResetPasswordRequest = {
      token: this.resetToken,
      new_password: password,
    };

    this.authService.resetPassword(request).subscribe({
      next: () => {
        alert('Sua senha foi redefinida com sucesso');
        this.router.navigate(['/auth/login']);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          console.warn('O token passado não existe na base de dados');
          alert('A solicitação não existe mais');
        } else if (err.status === 403) {
          console.warn('O tempo de validade do token expirou');
          alert('O tempo para realizar a solicitação expirou, tente novamente');
        } else {
          console.error('Erro ao enviar solicitação:', err);
          alert('Erro de redefinição da senha: ' + err);
        }

        this.router.navigate(['/auth/forgot-password']);
      },
    });
  }
}
