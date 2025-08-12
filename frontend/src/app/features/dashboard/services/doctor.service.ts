import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  crm: string;
  location: string;
  status?: 'linked' | 'pending' | 'unlinked';
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

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private http = inject(HttpClient);

  searchDoctors(term: string): Observable<Doctor[]> {
    // Simula uma chamada de API com dados de exemplo
    const mockDoctors: Doctor[] = [
      {
        id: 1,
        name: 'Dr. Carlos Santos',
        specialty: 'Neurologia',
        crm: 'CRM-PR 12345',
        location: 'Curitiba, PR',
      },
      {
        id: 2,
        name: 'Dra. Mariana Costa',
        specialty: 'Neurologia',
        crm: 'CRM-PR 54321',
        location: 'Curitiba, PR',
      },
      {
        id: 3,
        name: 'Dr. Ricardo Lima',
        specialty: 'Geriatria',
        crm: 'CRM-PR 56789',
        location: 'São Paulo, SP',
      },
    ];
    console.log(`Buscando médicos com o termo: ${term}`);
    return of(mockDoctors);
  }

  /**
   * Paciente solicita vínculo com um médico.
   * @param doctorId O ID do médico.
   */
  requestBinding(doctorId: number): Observable<any> {
    return this.http.post('/api/bindings/request', { doctor_id: doctorId });
  }

  /**
   * Busca as solicitações de vínculo pendentes para o médico logado.
   */
  getBindingRequests(): Observable<BindingRequest[]> {
    return this.http.get<BindingRequest[]>('/api/bindings/requests');
  }

  /**
   * Médico aceita uma solicitação de vínculo.
   * @param bindingId O ID da solicitação.
   */
  acceptBindingRequest(bindingId: number): Observable<any> {
    return this.http.post(`/api/bindings/${bindingId}/accept`, {});
  }

  /**
   * Médico recusa uma solicitação de vínculo.
   * @param bindingId O ID da solicitação.
   */
  rejectBindingRequest(bindingId: number): Observable<any> {
    return this.http.post(`/api/bindings/${bindingId}/reject`, {});
  }
}
