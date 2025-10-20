import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PatientFullProfile } from '../../../core/models/patient-full-profile.model';
import { PatientStatistics } from '../../../core/models/patient-statistics.model';
import { PatientTimeline } from '../../../core/models/patient-timeline.model';

@Injectable({
  providedIn: 'root',
})
export class PatientDetailService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Busca o perfil completo de um paciente incluindo endereço e informações pessoais.
   */
  getPatientProfile(patientId: number): Observable<PatientFullProfile> {
    return this.http.get<PatientFullProfile>(
      `${this.apiUrl}/users/patient/${patientId}/profile`,
      { withCredentials: true }
    );
  }

  /**
   * Busca estatísticas agregadas dos testes de um paciente.
   * Inclui tendência, scores médios, melhores/piores resultados, etc.
   */
  getPatientStatistics(patientId: number): Observable<PatientStatistics> {
    return this.http.get<PatientStatistics>(
      `${this.apiUrl}/tests/patient/${patientId}/statistics`,
      { withCredentials: true }
    );
  }

  /**
   * Busca timeline completa de testes de um paciente ordenada cronologicamente.
   * Útil para visualizações e gráficos de progressão.
   */
  getPatientTimeline(patientId: number): Observable<PatientTimeline> {
    return this.http.get<PatientTimeline>(
      `${this.apiUrl}/tests/patient/${patientId}/timeline`,
      { withCredentials: true }
    );
  }
}
