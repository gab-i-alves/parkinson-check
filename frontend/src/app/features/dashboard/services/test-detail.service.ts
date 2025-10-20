import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TestDetail } from '../../../core/models/test-detail.model';

@Injectable({
  providedIn: 'root',
})
export class TestDetailService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Busca os detalhes completos de um teste individual.
   * Inclui informações do teste, paciente e classificação.
   * Apenas médicos com acesso ao paciente podem visualizar.
   */
  getTestDetail(testId: number): Observable<TestDetail> {
    return this.http.get<TestDetail>(`${this.apiUrl}/tests/test/${testId}`, {
      withCredentials: true,
    });
  }
}
