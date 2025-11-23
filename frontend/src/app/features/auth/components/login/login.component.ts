import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { UserRole } from '../../../../core/models/user.model';
import { AuthService } from '../../services/auth.services';
import { UserService } from '../../../../core/services/user.service';
import { LoginForm } from '../../../../core/models/login.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  animations: [
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ transform: 'translateY(100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class LoginComponent implements OnInit {
  activeTab: UserRole = 'paciente';

  loginForm!: FormGroup<{
    email: FormControl<string | null>;
    password: FormControl<string | null>;
    remember: FormControl<boolean | null>;
  }>;

  isLoading = false;
  apiError: string | null = null;

  buttonTouched = false;
  showPassword = false;

  // Toast notification properties
  showToast = false;
  toastMessage = '';
  toastType: 'error' | 'success' = 'error';
  private toastTimeout?: number;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      remember: [false],
    });
  }

  get emailPlaceholder(): string {
    switch (this.activeTab) {
      case 'paciente':
        return 'Digite seu e-mail';
      case 'medico':
        return 'Digite seu e-mail profissional';
      case 'admin':
        return 'Digite seu e-mail de administrador';
      default:
        return 'Digite seu e-mail';
    }
  }

  selectTab(role: UserRole): void {
    this.activeTab = role;
    this.loginForm.reset({ remember: false });
    this.apiError = null;
    this.closeToast();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  showToastNotification(message: string, type: 'error' | 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    // Clear any existing timeout
    if (this.toastTimeout) {
      window.clearTimeout(this.toastTimeout);
    }

    // Auto-hide toast after 5 seconds
    this.toastTimeout = window.setTimeout(() => {
      this.closeToast();
    }, 5000);
  }

  closeToast(): void {
    this.showToast = false;
    if (this.toastTimeout) {
      window.clearTimeout(this.toastTimeout);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.closeToast();
    this.isLoading = true;
    this.loginForm.disable();

    const credentials: LoginForm = {
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!,
      remember: this.loginForm.value.remember ?? false,
    };

    console.log('Dados do formulário:', credentials);

    this.authService.login(credentials).subscribe({
      next: () => {
        console.log('Login bem-sucedido.');

        // UserService já foi atualizado pelo AuthService com role mapeado
        const currentUser = this.userService.getCurrentUser();

        console.log('Usuário sincronizado no UserService:', currentUser);

        // Show success toast
        this.showToastNotification('Login realizado com sucesso!', 'success');

        // Navigate after a short delay to show the toast
        setTimeout(() => {
          if (currentUser?.role === 'medico') {
            this.router.navigate(['/dashboard/doctor']);
          } else if (currentUser?.role === 'admin') {
            this.router.navigate(['/dashboard/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }, 1000);
      },
      error: (err) => {
        console.error('Erro no login:', err);

        let errorMessage = 'E-mail ou senha inválidos. Tente novamente.';

        if (err.error?.detail) {
          errorMessage = err.error.detail;
        }

        this.showToastNotification(errorMessage, 'error');
        this.isLoading = false;
        this.loginForm.enable();
      },
      complete: () => {
        this.isLoading = false;
        this.loginForm.enable();
      },
    });
  }
}
