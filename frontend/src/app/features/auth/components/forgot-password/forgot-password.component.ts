import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../../services/auth.services';
import { RouterLink } from '@angular/router';
import { ForgotPasswordRequest } from '../../../../core/models/reset-password-request.model';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../shared/services/toast.service';
import { TooltipDirective } from '../../../../shared/directives/tooltip.directive';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TooltipDirective],
  templateUrl: './forgot-password.component.html',
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
export class ForgotPassword {
  forgotPasswordForm!: FormGroup<{
    email: FormControl<string | null>;
  }>;

  isLoading = false;
  showSuccessState = false;
  buttonTouched = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService
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

    this.isLoading = true;
    this.forgotPasswordForm.disable();

    const request: ForgotPasswordRequest = {
      email: this.forgotPasswordForm.value.email!,
    };

    this.authService.forgotPassword(request).subscribe({
      next: () => {
        this.showSuccessState = true;
        this.toastService.success(
          'E-mail enviado! Verifique sua caixa de entrada e spam.',
          'Link de recuperação enviado'
        );
      },
      error: (err: any) => {
        this.toastService.error(
          'Um erro interno ocorreu, tente novamente',
          'Erro ao enviar'
        );
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
