import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpResponse,
  HttpParams,
} from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { Doctor } from '../../../core/models/doctor.model';
import { BindingRequest } from '../../../core/models/binding-request.model';
import { PatientBindingRequest } from '../../../core/models/patient-binding-request.model';
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

  searchDoctors(term: string, specialty: string): Observable<Doctor[] | null> {
    let params = new HttpParams();

    if (term) {
      params = params.append('name', term);
    }
    if (specialty) {
      params = params.append('expertise_area', specialty);
    }

    return this.http
      .get<Doctor[]>(BASE_URL, {
        ...this.getHttpOptions(),
        params: params,
      })
      .pipe(
        map((resp: HttpResponse<Doctor[]>) => {
          if (resp.status === 200 && resp.body) {
            return resp.body.map((doctor) => ({
              ...doctor,
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
        map((resp: HttpResponse<Doctor[]>) => {
          if (resp.status === 200 && resp.body) {
            const doctors = resp.body.map((item) => ({
              ...item,
              bindingId: item.bind_id, // Mapeia bind_id para bindingId
            }));
            return doctors;
          }
          return null;
        }),
        catchError((err) => throwError(() => err))
      );
  }

  loadSentRequests(): Observable<PatientBindingRequest[] | null> {
    return this.http
      .get<PatientBindingRequest[]>(
        '/api/bindings/requests/sent',
        this.getHttpOptions()
      )
      .pipe(
        map((resp: HttpResponse<PatientBindingRequest[]>) => {
          if (resp.status == 200) {
            console.log(resp.body);
            return resp.body;
          } else {
            return null;
          }
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  /**
   * Paciente solicita vínculo com um médico.
   * @param doctorId O ID do médico.
   */
  requestBinding(doctorId: number): Observable<any> {
    return this.http.post(
      '/api/bindings/request',
      { doctor_id: doctorId },
      this.getHttpOptions()
    );
  }

  /**
   * Busca as solicitações de vínculo pendentes para o médico logado.
   */
  getBindingRequests(): Observable<BindingRequest[] | null> {
    return this.http
      .get<BindingRequest[]>('/api/bindings/requests', this.getHttpOptions())
      .pipe(
        map((resp: HttpResponse<BindingRequest[]>) => {
          if (resp.status == 200) {
            return resp.body;
          } else {
            return null;
          }
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  /**
   * Médico aceita uma solicitação de vínculo.
   * @param bindingId O ID da solicitação.
   */
  acceptBindingRequest(bindingId: number): Observable<any> {
    return this.http.post(
      `/api/bindings/${bindingId}/accept`,
      {},
      this.getHttpOptions()
    );
  }

  /**
   * Médico recusa uma solicitação de vínculo.
   * @param bindingId O ID da solicitação.
   */
  rejectBindingRequest(bindingId: number): Observable<any> {
    return this.http.post(
      `/api/bindings/${bindingId}/reject`,
      {},
      this.getHttpOptions()
    );
  }

  unlinkDoctor(bindingId: number): Observable<any> {
    return this.http.delete<void>(
      `api/bindings/${bindingId}`,
      this.getHttpOptions()
    );
  }

  /**
   * Médico busca todos os pacientes disponíveis no sistema (exceto já vinculados).
   */
  searchPatients(term: string, cpf: string): Observable<any[] | null> {
    let params = new HttpParams();

    if (term) {
      params = params.append('name', term);
    }
    if (cpf) {
      params = params.append('cpf', cpf);
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

  /**
   * Médico solicita vínculo com um paciente.
   */
  requestBindingWithPatient(patientId: number): Observable<any> {
    return this.http.post(
      '/api/bindings/request',
      { patient_id: patientId },
      this.getHttpOptions()
    );
  }

  /**
   * Médico busca solicitações enviadas para pacientes (pendentes).
   */
  getSentRequestsToPatients(): Observable<any[] | null> {
    return this.http
      .get<any[]>('/api/bindings/requests/sent-by-doctor', this.getHttpOptions())
      .pipe(
        map((resp: HttpResponse<any[]>) => {
          if (resp.status === 200) {
            return resp.body;
          }
          return null;
        }),
        catchError((err) => throwError(() => err))
      );
  }

  /**
   * Médico desvincular paciente.
   */
  unlinkPatient(bindingId: number): Observable<any> {
    return this.http.delete<void>(
      `/api/bindings/${bindingId}`,
      this.getHttpOptions()
    );
  }

  /**
   * Paciente busca solicitações recebidas de médicos (pendentes).
   */
  getReceivedRequestsFromDoctors(): Observable<any[] | null> {
    return this.http
      .get<any[]>('/api/bindings/requests/received', this.getHttpOptions())
      .pipe(
        map((resp: HttpResponse<any[]>) => {
          if (resp.status === 200) {
            return resp.body;
          }
          return null;
        }),
        catchError((err) => throwError(() => err))
      );
  }

  /**
   * Paciente aceita solicitação de vínculo de um médico.
   */
  acceptDoctorRequest(bindingId: number): Observable<any> {
    return this.http.post(
      `/api/bindings/${bindingId}/accept-by-patient`,
      {},
      this.getHttpOptions()
    );
  }

  /**
   * Paciente rejeita solicitação de vínculo de um médico.
   */
  rejectDoctorRequest(bindingId: number): Observable<any> {
    return this.http.post(
      `/api/bindings/${bindingId}/reject-by-patient`,
      {},
      this.getHttpOptions()
    );
  }
}
