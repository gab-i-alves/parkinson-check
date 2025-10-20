import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, of, delay, map, catchError, throwError } from 'rxjs';
import {
  Patient,
  PaginatedPatients,
  PatientFilters,
} from '../../../core/models/patient.model';
import { environment } from '../../../../environments/environment';

interface PatientBackendResponse {
  id: number;
  name: string;
  cpf: string;
  email: string;
  age: number;
  status: string;
  last_test_date: string | null;
  last_test_type: string | null;
  tests_count: number;
  bind_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class DoctorDashboardService {
  private http = inject(HttpClient);
  private allPatients: Patient[] = [];

  readonly patients = signal<Patient[]>([]);

  constructor() {}

  private getHttpOptions() {
    const token = localStorage.getItem('auth_token');
    return {
      observe: 'response' as const,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  private mapBackendPatientToFrontend(
    backendPatient: PatientBackendResponse
  ): Patient {
    return {
      id: backendPatient.id.toString(),
      name: backendPatient.name,
      age: backendPatient.age,
      cpf: backendPatient.cpf,
      email: backendPatient.email,
      status: backendPatient.status as 'stable' | 'attention' | 'critical',
      lastTestDate: backendPatient.last_test_date || '',
      lastTestType: backendPatient.last_test_type as 'spiral' | 'voice' | undefined,
      testsCount: backendPatient.tests_count,
      bindingId: backendPatient.bind_id,
    };
  }

  private loadAllPatients(): Observable<Patient[]> {
    return this.http
      .get<PatientBackendResponse[]>(
        `${environment.apiUrl}/users/linked_patients/dashboard`,
        this.getHttpOptions()
      )
      .pipe(
        map((resp: HttpResponse<PatientBackendResponse[]>) => {
          if (resp.status === 200 && resp.body) {
            return resp.body.map((p) => this.mapBackendPatientToFrontend(p));
          }
          return [];
        }),
        catchError((err) => {
          console.error('Erro ao buscar pacientes:', err);
          return throwError(() => err);
        })
      );
  }

  getPatientsPage(
    page: number,
    pageSize: number,
    filters?: PatientFilters
  ): Observable<PaginatedPatients> {
    return this.loadAllPatients().pipe(
      map((allPatients) => {
        this.allPatients = allPatients;
        let filteredPatients = [...allPatients];

        if (filters?.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filteredPatients = filteredPatients.filter(
            (p) =>
              p.name.toLowerCase().includes(query) ||
              p.cpf?.includes(query) ||
              false
          );
        }

        if (filters?.status) {
          filteredPatients = filteredPatients.filter(
            (p) => p.status === filters.status
          );
        }

        if (filters?.testType) {
          filteredPatients = filteredPatients.filter(
            (p) => p.lastTestType === filters.testType
          );
        }

        const total = filteredPatients.length;
        const totalPages = Math.ceil(total / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const patients = filteredPatients.slice(startIndex, endIndex);

        const result: PaginatedPatients = {
          patients,
          total,
          page,
          pageSize,
          totalPages,
        };

        return result;
      })
    );
  }

  searchPatients(
    query: string,
    filters: PatientFilters = {}
  ): Observable<Patient[]> {
    const searchFilters: PatientFilters = {
      ...filters,
      searchQuery: query,
    };

    return new Observable((observer) => {
      this.getPatientsPage(1, 100, searchFilters).subscribe((result) => {
        observer.next(result.patients);
        observer.complete();
      });
    });
  }
}
