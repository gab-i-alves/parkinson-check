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
import { UserRole } from '../../../../core/models/user.model';
import { AuthService } from '../../services/auth.services';
import { UserService } from '../../../../core/services/user.service';
import { LoginForm } from '../../../../core/models/login.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
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
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.apiError = null;
    this.isLoading = true;
    this.loginForm.disable();

    const credentials: LoginForm = {
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!,
    };

    console.log('Dados do formulário:', credentials);

    this.authService.login(credentials).subscribe({
      next: () => {
        console.log('Login bem-sucedido.');

        // UserService já foi atualizado pelo AuthService com role mapeado
        const currentUser = this.userService.getCurrentUser();

        console.log('Usuário sincronizado no UserService:', currentUser);

        if (currentUser?.role === 'medico') {
          this.router.navigate(['/dashboard/doctor']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Erro no login:', err);
        this.apiError = 'E-mail ou senha inválidos. Tente novamente.';
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
