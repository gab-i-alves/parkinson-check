import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../../../core/models/user.model';
import { LoginForm } from '../../../core/models/login.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

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
      }),
      catchError(() => {
        this.currentUserSubject.next(null);
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
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
      },
    });
  }

  registerPatient(patientData: any): Observable<any> {
    return this.http.post<any>('/api/register/patient', patientData);
  }

  registerDoctor(doctorData: any): Observable<any> {
    return this.http.post<any>('/api/register/doctor', doctorData);
  }
}
