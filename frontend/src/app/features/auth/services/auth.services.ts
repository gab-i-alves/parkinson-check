import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserRole, UserProfile } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private userService: UserService) {}

  login(credentials: any, role: UserRole): Observable<any> {
    const payload = {
      email: credentials.email,
      password: credentials.password,
    };

    return this.http.post<any>('/api/auth/login', payload).pipe(
      tap((user) => {
        if (user) {
          const mappedRole = user.role === 2 ? 'medico' : 'paciente';
          const userProfile: UserProfile = {
            name: user.name,
            role: mappedRole,
            email: user.email,
          };
          this.userService.setCurrentUser(userProfile);
        }
      })
    );
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>('/api/users/me').pipe(
      tap((user) => {
        const mappedRole = user.role === 2 ? 'medico' : 'paciente';
        const userProfile: UserProfile = {
          name: user.name,
          role: mappedRole,
          email: user.email,
        };
        this.userService.setCurrentUser(userProfile);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post('/api/auth/logout', {}).pipe(
      tap(() => {
        this.userService.clearCurrentUser();
      })
    );
  }

  registerPatient(patientData: any): Observable<any> {
    return this.http.post<any>('/api/register/patient', patientData);
  }

  registerDoctor(doctorData: any): Observable<any> {
    return this.http.post<any>('/api/register/doctor', doctorData);
  }
}
