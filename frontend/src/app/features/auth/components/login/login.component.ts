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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  // DECISÃO: A aba ativa (activeTab) controla não apenas a UI, mas também a lógica de negócio,
  // sendo enviada para a API para determinar o tipo de autenticação.
  activeTab: UserRole = 'paciente';

  // DECISÃO: Utilização de FormGroup com tipagem forte.
  // Garante que os valores do formulário (this.loginForm.value) sejam type-safe,
  // prevenindo bugs de acesso a propriedades inexistentes e melhorando o autocompletar.
  loginForm!: FormGroup<{
    email: FormControl<string | null>;
    password: FormControl<string | null>;
    remember: FormControl<boolean | null>;
  }>;

  // COMPORTAMENTO: A flag 'isLoading' gerencia o estado visual da UI durante a chamada assíncrona.
  // Previne que o usuário envie o formulário múltiplas vezes enquanto aguarda a resposta.
  isLoading = false;

  // COMPORTAMENTO: Armazena mensagens de erro vindas da API.
  // É separada dos erros de validação do formulário para fornecer feedback distinto ao usuário.
  apiError: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  // DECISÃO: A inicialização do formulário ocorre no ngOnInit para garantir que o componente
  // esteja pronto e que a lógica de criação do form seja executada apenas uma vez.
  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required, Validators.minLength(8)],
      remember: [false],
    });
  }

  // DECISÃO: Utilização de um getter para lógica de apresentação.
  // Mantém o template (HTML) limpo, delegando a lógica condicional do placeholder
  // para o componente, onde ela pode ser facilmente testada e mantida.
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
    // COMPORTAMENTO: "Guard Clause" para validação. Se o formulário for inválido,
    // a execução é interrompida imediatamente, evitando chamadas desnecessárias à API.
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Exibe os erros de validação para o usuário.
      return;
    }

    // Gerenciamento de estado antes da chamada assíncrona.
    this.apiError = null;
    this.isLoading = true;
    this.loginForm.disable();

    console.log('Dados do formulário:', this.loginForm.value);

    // DECISÃO: A lógica de negócio é delegada ao AuthService.
    // O método .subscribe() trata os dois principais cenários de uma chamada HTTP:
    // 'next' para sucesso e 'error' para falha.
    this.authService.login(this.loginForm.value, this.activeTab).subscribe({
      next: (response) => {
        console.log('Login realizado com sucesso.', response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erro no login:', err);
        this.apiError = 'E-mail ou senha inválidos. Tente novamente.';

        // COMPORTAMENTO: Em caso de erro, o formulário é reabilitado para permitir
        // que o usuário corrija os dados e tente novamente.
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
