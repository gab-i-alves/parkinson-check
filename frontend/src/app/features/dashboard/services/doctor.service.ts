import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpResponse,
  HttpParams,
} from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Doctor } from '../../../core/models/doctor.model';
import { environment } from '../../../../environments/environment';

const BASE_URL = `${environment.apiUrl}/users/doctors`;

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private http = inject(HttpClient);

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

  searchDoctors(term: string, specialty: string, location?: string): Observable<Doctor[] | null> {
    let params = new HttpParams();

    if (term) {
      params = params.append('name', term);
    }
    if (specialty) {
      params = params.append('expertise_area', specialty);
    }
    if (location) {
      params = params.append('location', location);
    }

    return this.http
      .get<any[]>(BASE_URL, {
        ...this.getHttpOptions(),
        params: params,
      })
      .pipe(
        map((resp: HttpResponse<any[]>) => {
          if (resp.status === 200 && resp.body) {
            return resp.body.map((doctor) => ({
              ...doctor,
              expertise_area: doctor.specialty || doctor.expertise_area,
              bindingId: doctor.bind_id,
            }));
          }
          return null;
        }),
        catchError((err) => {
          console.error('Erro ao buscar médicos:', err);
          return throwError(() => err);
        })
      );
  }

  loadLinkedDoctors(): Observable<Doctor[] | null> {
    return this.http
      .get<any[]>('/api/users/linked_doctors', this.getHttpOptions())
      .pipe(
        map((resp: HttpResponse<any[]>) => {
          if (resp.status === 200 && resp.body) {
            const doctors = resp.body.map((item) => ({
              ...item,
              expertise_area: item.specialty || item.expertise_area,
              bindingId: item.bind_id, // Mapeia bind_id para bindingId
            }));
            return doctors;
          }
          return null;
        }),
        catchError((err) => throwError(() => err))
      );
  }

  /**
   * Médico busca todos os pacientes disponíveis no sistema (exceto já vinculados).
   */
  searchPatients(term: string, cpf: string, status?: string): Observable<any[] | null> {
    let params = new HttpParams();

    if (term) {
      params = params.append('name', term);
    }
    if (cpf) {
      params = params.append('cpf', cpf);
    }
    if (status) {
      params = params.append('status', status);
    }

    return this.http
      .get<any[]>('/api/users/patients', {
        ...this.getHttpOptions(),
        params: params,
      })
      .pipe(
        map((resp: HttpResponse<any[]>) => {
          if (resp.status === 200 && resp.body) {
            return resp.body;
          }
          return null;
        }),
        catchError((err) => {
          console.error('Erro ao buscar pacientes:', err);
          return throwError(() => err);
        })
      );
  }

}
