import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserRole } from '../../../../core/models/user.model';
import { AuthService } from '../../services/auth.services';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  readonly activeTab = signal<UserRole>('paciente');
  readonly isLoading = signal(false);
  readonly apiError = signal<string | null>(null);

  readonly emailPlaceholder = computed(() => {
    switch (this.activeTab()) {
      case 'paciente':
        return 'Digite seu e-mail';
      case 'medico':
        return 'Digite seu e-mail profissional';
      case 'admin':
        return 'Digite seu e-mail de administrador';
    }
  });

  readonly loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    remember: [false],
  });

  selectTab(role: UserRole): void {
    this.activeTab.set(role);
    this.loginForm.reset({ remember: false });
    this.apiError.set(null);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.apiError.set(null);
    this.isLoading.set(true);
    this.loginForm.disable();

    console.log('Dados do formulário:', this.loginForm.value);

    this.authService.login(this.loginForm.value, this.activeTab()).subscribe({
      next: () => {
        const currentUser = this.userService.currentUser();
        const destination =
          currentUser?.role === 'medico' ? '/dashboard/doctor' : '/dashboard';
        this.router.navigate([destination]);
      },
      error: (err) => {
        console.error('Erro no login:', err);
        this.apiError.set('E-mail ou senha inválidos. Tente novamente.');
        this.isLoading.set(false);
        this.loginForm.enable();
      },
    });
  }
}
