import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../../services/auth.services';
import { strongPasswordValidator } from '../../../../core/validators/custom-validators';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ResetPasswordRequest } from '../../../../core/models/reset-password-request.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../../../shared/services/toast.service';
import { TooltipDirective } from '../../../../shared/directives/tooltip.directive';

// Custom validator for password match
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  return password.value === confirmPassword.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TooltipDirective],
  templateUrl: './reset-password.component.html',
  animations: [
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ResetPassword {
  resetPasswordForm!: FormGroup<{
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
  }>;

  resetToken: string = '';
  isLoading = false;
  showSuccessState = false;

  buttonTouched = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
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
    }, { validators: passwordMatchValidator });

    const urlToken = this.route.snapshot.paramMap.get('token');
    if (urlToken) {
      this.resetToken = urlToken;
    } else {
      this.toastService.error(
        'Solicite a redefinição de senha novamente',
        'Token não encontrado'
      );
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.resetPasswordForm.disable();

    const request: ResetPasswordRequest = {
      token: this.resetToken,
      new_password: this.resetPasswordForm.value.password!,
    };

    this.authService.resetPassword(request).subscribe({
      next: () => {
        this.showSuccessState = true;
        this.toastService.success(
          'Você será redirecionado para o login',
          'Senha redefinida com sucesso'
        );
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.toastService.error(
            'A solicitação não existe mais',
            'Token inválido'
          );
        } else if (err.status === 403) {
          this.toastService.error(
            'O tempo para realizar a solicitação expirou, tente novamente',
            'Token expirado'
          );
        } else {
          this.toastService.error(
            'Um erro interno ocorreu, tente novamente',
            'Erro ao redefinir senha'
          );
        }
        this.isLoading = false;
        this.resetPasswordForm.enable();
        setTimeout(() => {
          this.router.navigate(['/auth/forgot-password']);
        }, 2000);
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
