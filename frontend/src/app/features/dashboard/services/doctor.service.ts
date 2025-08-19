import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';

const BASE_URL = '/api/users/doctors'

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  crm: string;
  location: string;
  status?: 'pending' | 'linked' | 'unlinked';
}

export interface BindingRequest {
  id: number;
  patient: {
    id: number;
    name: string;
    email: string;
  };
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
}

export interface PatientBindingRequest {
  id: number;
  doctor: Doctor
}

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private http = inject(HttpClient);

    getHttpOptions() {
    const token = localStorage.getItem('auth_token');
    return {
      observe: "response" as const,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  searchDoctors(term: string, specialty: string): Observable<Doctor[] | null> {

    var specialtyParameter = ""

    if (specialty != '') {
      specialtyParameter = "&specialty=" + specialty
    }

    return this.http.get<Doctor[]>(
      BASE_URL + "/?name=" + term + specialtyParameter,
      this.getHttpOptions()).pipe(
        map((resp: HttpResponse<Doctor[]>) => {
          if(resp.status==200){
            console.log(resp.body)
            return resp.body
          }else{
            return null
          }
        }),
        catchError((err) => {
          return throwError(() => err)
        })
      )
  }

  loadLinkedDoctors(): Observable<Doctor[] | null> {

    return this.http.get<Doctor[]>(
      '/api/users/linked_doctors',
      this.getHttpOptions()).pipe(
        map((resp: HttpResponse<Doctor[]>) => {
          if(resp.status==200){
            console.log(resp.body)
            return resp.body
          }else{
            return null
          }
        }),
        catchError((err) => {
          return throwError(() => err)
        })
      )
  }

  loadSentRequests(): Observable<PatientBindingRequest[] | null> {
    return this.http.get<PatientBindingRequest[]>(
      '/api/bindings/requests/sent',
      this.getHttpOptions()).pipe(
        map((resp: HttpResponse<PatientBindingRequest[]>) => {
          if(resp.status==200){
            console.log(resp.body)
            return resp.body
          }else{
            return null
          }
        }),
        catchError((err) => {
          return throwError(() => err)
        })
      )
  }

  /**
   * Paciente solicita vínculo com um médico.
   * @param doctorId O ID do médico.
   */
  requestBinding(doctorId: number): Observable<any> {
    return this.http.post('/api/bindings/request', { doctor_id: doctorId }, this.getHttpOptions());
  }

  /**
   * Busca as solicitações de vínculo pendentes para o médico logado.
   */
  getBindingRequests(): Observable<BindingRequest[] | null> {
    return this.http.get<BindingRequest[]>('/api/bindings/requests', this.getHttpOptions()).pipe(
        map((resp: HttpResponse<BindingRequest[]>) => {
          if(resp.status==200){
            return resp.body
          }else{
            return null
          }
        }),
        catchError((err) => {
          return throwError(() => err)
        })
      );
  }

  /**
   * Médico aceita uma solicitação de vínculo.
   * @param bindingId O ID da solicitação.
   */
  acceptBindingRequest(bindingId: number): Observable<any> {
    return this.http.post(`/api/bindings/${bindingId}/accept`, {}, this.getHttpOptions());
  }

  /**
   * Médico recusa uma solicitação de vínculo.
   * @param bindingId O ID da solicitação.
   */
  rejectBindingRequest(bindingId: number): Observable<any> {
    return this.http.post(`/api/bindings/${bindingId}/reject`, {}, this.getHttpOptions());
  }
}
