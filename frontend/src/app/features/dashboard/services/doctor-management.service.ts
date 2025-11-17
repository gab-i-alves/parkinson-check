import { Injectable, signal } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Doctor, DoctorDocument, DoctorFilters, DoctorStatus, PaginatedDoctors, UserType } from '@core/models';

interface DoctorBackendResponse {
  id: number;
  name: string;
  crm: string;
  email: string;
  status: string;
  location: string;
  specialty: string;
  reason?: string;
  approved_by?: string;
  approval_date?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
}

export interface ChangeStatusData {
  status: DoctorStatus;
  reason?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DoctorManagementService {
  private apiUrl = environment.apiUrl;
  private allDoctors: Doctor[] = [];

  readonly doctors = signal<Doctor[]>([]);

  constructor(private http: HttpClient) {}

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

  mapBackendDoctorToFrontend(backendDoctor: DoctorBackendResponse): Doctor {
    console.log(backendDoctor)
    return {
      id: backendDoctor.id,
      name: backendDoctor.name,
      approval_status: this.mapDoctorStatus(backendDoctor.status) ,
      crm: backendDoctor.crm,
      location: backendDoctor.location,
      expertise_area: backendDoctor.specialty,
      email: backendDoctor.email,
      approved_by: backendDoctor.approved_by,
      approval_date: backendDoctor.approval_date,
    };
  }

  mapDoctorStatus(status: string): DoctorStatus {
    switch (status){
      case "approved":
        return "aprovado(a)"
      case "rejected":
        return "rejeitado(a)"
      case "suspended":
        return "suspenso(a)"
      case "in_review":
        return "em_revisao"
      default:
        return 'pendente'
    }
  }

  private loadAllDoctors(): Observable<Doctor[]> {
    return this.http
      .get<DoctorBackendResponse[]>(
        `${environment.apiUrl}/admin/doctors`,
        this.getHttpOptions()
      )
      .pipe(
        map((resp: HttpResponse<DoctorBackendResponse[]>) => {
          if (resp.status === 200 && resp.body) {
            console.log(resp.body)
            return resp.body.map((p) => this.mapBackendDoctorToFrontend(p));
          }
          return [];
        }),
        catchError((err) => {
          console.error('Erro ao buscar usuários:', err);
          return throwError(() => err);
        })
      );
  }

  getDoctorsPage(
    page: number,
    pageSize: number,
    filters?: DoctorFilters
  ): Observable<PaginatedDoctors> {
    return this.loadAllDoctors().pipe(
      map((allUsers) => {
        this.allDoctors = allUsers;
        let filteredUsers = [...allUsers];

        if (filters?.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          console.log(query)
          filteredUsers = filteredUsers.filter(
            (p) =>
              p.name.toLowerCase().includes(query) ||
              p.crm?.includes(query) ||
              p.email?.includes(query) ||
              false
          );
        }
        
        console.log(filters?.area)
        if (filters?.area !== undefined && filters?.area !== "") {
          const area = filters?.area 

          filteredUsers = filteredUsers.filter(
            (u) => u.expertise_area === area
          );
        }

        console.log(filters?.approval_status)
        if (filters?.approval_status !== undefined && filters?.approval_status !== "") {
          filteredUsers = filteredUsers.filter(
            (u) => (u.approval_status) === (filters.approval_status)
          );
        }

        const total = filteredUsers.length;
        const totalPages = Math.ceil(total / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const doctors = filteredUsers.slice(startIndex, endIndex);

        const result: PaginatedDoctors = {
          doctors,
          total,
          page,
          pageSize,
          totalPages,
        };

        return result;
      })
    );
  }

getDoctorById(userId: number): Observable<DoctorBackendResponse | null> {
  return this.http.get<DoctorBackendResponse>(`${this.apiUrl}/admin/doctors/${userId}`).pipe(
    catchError((error) => {
      console.error('Erro ao buscar médico:', error);
      return of(null); 
    })
  );
}

  getPendingDoctors(): Observable<Doctor[] | null> {
    return this.http
      .get<any[]>(`${environment.apiUrl}/admin/doctors/pending`, this.getHttpOptions())
      .pipe(
        map((resp: HttpResponse<Doctor[]>) => {
          if (resp.status === 200 && resp.body) {
            const doctors = resp.body.map((item) => ({
              ...item,
            }));
            return doctors;
          }
          return null;
        }),
        catchError((err) => throwError(() => err))
      );
  }

  approveDoctor(doctor_id: any, experience_level: any): Observable<any> {
    // CreateUserData, User
    return this.http.post<any>(`${this.apiUrl}/admin/doctors/${doctor_id}/approve`, experience_level);
  }

  rejectDoctor(doctor_id: any, reason: any): Observable<any> {
    // CreateUserData, User
    return this.http.post<any>(`${this.apiUrl}/admin/doctors/${doctor_id}/reject`, reason);
  }

  changeDoctorStatus(doctor_id: number, status: ChangeStatusData): Observable<any> {
    // User
    return this.http.patch<any>(
      `${this.apiUrl}/admin/doctors/${doctor_id}/status`,
      status
    );
  }

  getDoctorDocuments(doctorId: number): Observable<DoctorDocument[]> {
    return this.http.get<DoctorDocument[]>(`${this.apiUrl}/admin/doctors/${doctorId}/documents-info`);
  }

  downloadDocument(doctorId: number, documentId: number): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/admin/doctors/${doctorId}/documents/${documentId}`, {
    responseType: 'blob'
  });
}
}
