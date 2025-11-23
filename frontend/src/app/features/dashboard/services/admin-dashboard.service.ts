import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AdminStats } from '../../../core/models/admin-stats.model';
import { Doctor } from '../../../core/models/doctor.model';

const BASE_URL = `${environment.apiUrl}/admin/dashboard`;
const DOCTORS_URL = `${environment.apiUrl}/admin/doctors`;

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private http = inject(HttpClient);
  readonly pendentDoctors = signal<Doctor[]>([]);

  getHttpOptions() {
    const token = localStorage.getItem('auth_token');
    return {
      observe: 'response' as const,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  getDashboardStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${BASE_URL}`, this.getHttpOptions()).pipe(
      map((resp: HttpResponse<AdminStats>) => {
        if (resp.status === 200 && resp.body) {
          return resp.body;
        }
        throw new Error(
          `Falha ao carregar dados do painel. Status: ${resp.status}`
        );
      }),
      catchError((err) => {
        console.error('Erro ao buscar pacientes:', err);
        return throwError(() => err);
      })
    );
  }

  loadPendingDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${DOCTORS_URL}/pending`, this.getHttpOptions()).pipe(
      map((resp: HttpResponse<Doctor[]>) => {
        if (resp.status === 200 && resp.body) {
          return resp.body;
        }
        throw new Error(
          `Falha ao carregar médicos pendentes. Status: ${resp.status}`
        );
      }),
      tap(doctors => this.pendentDoctors.set(doctors)),
      catchError((err) => {
        console.error('Erro ao buscar médicos pendentes:', err);
        this.pendentDoctors.set([]);
        return throwError(() => err);
      })
    );
  }

}
