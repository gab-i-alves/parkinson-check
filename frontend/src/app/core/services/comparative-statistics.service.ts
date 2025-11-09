import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ComparativeStatistics } from '../models/comparative-statistics.model';

@Injectable({
  providedIn: 'root',
})
export class ComparativeStatisticsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/statistics`;

  /**
   * Busca estatísticas comparativas do paciente autenticado.
   * Compara o desempenho com médias globais, por faixa etária, gênero e região.
   */
  getComparativeStatistics(): Observable<ComparativeStatistics> {
    return this.http.get<ComparativeStatistics>(`${this.apiUrl}/comparative`);
  }
}
