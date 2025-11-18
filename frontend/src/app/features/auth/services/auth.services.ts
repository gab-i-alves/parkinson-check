import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../../../core/models/user.model';
import { LoginForm } from '../../../core/models/login.model';
import { UserService } from '../../../core/services/user.service';
import { environment } from '../../../../environments/environment';
import {
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../../../core/models/reset-password-request.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private userService = inject(UserService);

  private apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.checkAuthStatus().subscribe();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verifica o status da autenticação chamando o endpoint /users/me.
   * Se o cookie for válido, o backend retornará os dados do usuário.
   */
  checkAuthStatus(): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/users/me`).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
        this.userService.setCurrentUser(user);
      }),
      catchError(() => {
        this.currentUserSubject.next(null);
        this.userService.setCurrentUser(null);
        return of(null);
      })
    );
  }

  /**
   * Realiza o login. O backend agora retorna o usuário e define o cookie HttpOnly.
   */
  login(credentials: LoginForm): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((user) => {
        // A resposta agora é o próprio usuário.
        // Armazenamos o usuário no nosso BehaviorSubject.
        this.currentUserSubject.next(user);

        // Sincronizar com UserService (faz mapeamento de role número → string)
        this.userService.setCurrentUser(user);
      })
    );
  }

  /**
   * Realiza o logout chamando o endpoint do backend para limpar o cookie.
   */
  logout(): void {
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({
      next: () => {
        this.currentUserSubject.next(null);
        this.userService.setCurrentUser(null);
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.currentUserSubject.next(null);
        this.userService.setCurrentUser(null);
        this.router.navigate(['/auth/login']);
      },
    });
  }

  registerPatient(patientData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register/patient`, patientData);
  }

  registerDoctor(doctorData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register/doctor`, doctorData);
  }

  forgotPassword(email: ForgotPasswordRequest): Observable<any> {
    return this.http.post<ForgotPasswordRequest>(
      `${this.apiUrl}/auth/forgot-password`,
      email
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<any> {
    return this.http.post<ResetPasswordRequest>(
      `${this.apiUrl}/auth/reset-password`,
      request
    );
  }

  sendDoctorDocumentation(uploadData: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/upload/doctor-document`,
      uploadData
    );
  }
}
