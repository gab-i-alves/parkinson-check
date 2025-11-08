import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TestDetail } from '../../../core/models/test-detail.model';
import { PatientTimeline } from '../../../core/models/patient-timeline.model';
import { PatientStatistics } from '../../../core/models/patient-statistics.model';

@Injectable({
  providedIn: 'root',
})
export class TestDetailService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Busca os detalhes completos de um teste individual (médico).
   * Inclui informações do teste, paciente e classificação.
   * Apenas médicos com acesso ao paciente podem visualizar.
   */
  getTestDetail(testId: number): Observable<TestDetail> {
    return this.http.get<TestDetail>(`${this.apiUrl}/tests/test/${testId}`, {
      withCredentials: true,
    });
  }

  /**
   * Busca a timeline completa de testes do próprio paciente.
   * Retorna todos os testes ordenados cronologicamente.
   * Requer autenticação de paciente.
   */
  getMyTestsTimeline(): Observable<PatientTimeline> {
    return this.http.get<PatientTimeline>(
      `${this.apiUrl}/tests/my-tests/timeline`,
      {
        withCredentials: true,
      }
    );
  }

  /**
   * Busca os detalhes completos de um teste do próprio paciente.
   * Inclui informações do teste e classificação.
   * Requer autenticação de paciente.
   */
  getMyTestDetail(testId: number): Observable<TestDetail> {
    return this.http.get<TestDetail>(
      `${this.apiUrl}/tests/my-tests/${testId}`,
      {
        withCredentials: true,
      }
    );
  }

  /**
   * Busca estatísticas agregadas dos testes do próprio paciente.
   * Inclui tendência, scores médios, melhores/piores resultados, etc.
   * Requer autenticação de paciente.
   */
  getMyTestsStatistics(): Observable<PatientStatistics> {
    return this.http.get<PatientStatistics>(
      `${this.apiUrl}/tests/my-tests/statistics`,
      {
        withCredentials: true,
      }
    );
  }
}
