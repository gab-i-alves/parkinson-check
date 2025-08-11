import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserRole } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private userService: UserService) {}

  /**
   * Envia as credenciais para o endpoint de login da API
   * @param credentials Objeto com email e password
   * @param role O perfil do usuário que está tentando logar
   * @returns Observable com a resposta do backend
   */
  login(credentials: any, role: UserRole): Observable<any> {
    const payload = {
      email: credentials.email,
      password: credentials.password,
    };

    return this.http.post<any>('/api/auth/login', payload).pipe(
      tap((response) => {
        if (response && response.access_token) {
          this.setToken(response.access_token);
          this.userService.setCurrentUser(response.user);
        }
      })
    );
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>('/api/users/me').pipe(
      tap((user) => {
        this.userService.setCurrentUser(user);
      })
    );
  }

  /**
   * Envia os dados do novo paciente para o endpoint de registro da API
   * @param patientData Objeto com os dados do formulário de registro
   * @returns Observable com a resposta do backend
   */
  registerPatient(patientData: any): Observable<any> {
    return this.http.post<any>('/api/register/patient', patientData);
  }

  /**
   * Envia os dados do novo médico para o endpoint de registro da API.
   * @param doctorData Objeto com os dados do formulário de registro do médico.
   * @returns Observable com a resposta do backend.
   */
  registerDoctor(doctorData: any): Observable<any> {
    // DECISÃO DE ARQUITETURA: Embora os dados de formulário do médico possam incluir arquivos,
    // esta chamada inicial enviará apenas os dados textuais (JSON). O upload de arquivos
    // irá ser tratado em uma requisição separada (multipart/form-data) após o registro inicial.
    return this.http.post<any>('/api/register/doctor', doctorData);
  }

  /**
   * Salva o token de autenticação no localStorage
   * @param token O token JWT recebido da API
   */
  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  /**
   * Remove o token durante o logout
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    this.userService.clearCurrentUser();
  }

  /**
   * Verifica se o usuário está autenticado (se existe um token)
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}
