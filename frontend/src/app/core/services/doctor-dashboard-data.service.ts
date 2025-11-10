import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  DashboardOverview,
  Rankings,
  ScoreEvolution,
  AgeGroupAnalysis,
  TestDistribution,
} from '../models/doctor-dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DoctorDashboardDataService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/doctor/dashboard`;

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

  getDashboardOverview(): Observable<DashboardOverview> {
    return this.http
      .get<DashboardOverview>(`${this.apiUrl}/overview`, this.getHttpOptions())
      .pipe(
        map((resp: HttpResponse<DashboardOverview>) => {
          if (resp.status === 200 && resp.body) {
            return resp.body;
          }
          throw new Error('Failed to fetch dashboard overview');
        }),
        catchError((err) => {
          console.error('Erro ao buscar visão geral do dashboard:', err);
          return throwError(() => err);
        })
      );
  }

  getRankings(
    rankingType: string = 'overall',
    limit: number = 10
  ): Observable<Rankings> {
    const params = { ranking_type: rankingType, limit: limit.toString() };
    return this.http
      .get<Rankings>(`${this.apiUrl}/rankings`, {
        ...this.getHttpOptions(),
        params,
      })
      .pipe(
        map((resp: HttpResponse<Rankings>) => {
          if (resp.status === 200 && resp.body) {
            return resp.body;
          }
          throw new Error('Failed to fetch rankings');
        }),
        catchError((err) => {
          console.error('Erro ao buscar rankings:', err);
          return throwError(() => err);
        })
      );
  }

  getScoreEvolution(
    timePeriod: string = 'month',
    testType: string = 'all'
  ): Observable<ScoreEvolution> {
    const params = { time_period: timePeriod, test_type: testType };
    return this.http
      .get<ScoreEvolution>(`${this.apiUrl}/score-evolution`, {
        ...this.getHttpOptions(),
        params,
      })
      .pipe(
        map((resp: HttpResponse<ScoreEvolution>) => {
          if (resp.status === 200 && resp.body) {
            return resp.body;
          }
          throw new Error('Failed to fetch score evolution');
        }),
        catchError((err) => {
          console.error('Erro ao buscar evolução de pontuações:', err);
          return throwError(() => err);
        })
      );
  }

  getAgeGroupAnalysis(): Observable<AgeGroupAnalysis> {
    return this.http
      .get<AgeGroupAnalysis>(`${this.apiUrl}/age-group-analysis`, this.getHttpOptions())
      .pipe(
        map((resp: HttpResponse<AgeGroupAnalysis>) => {
          if (resp.status === 200 && resp.body) {
            return resp.body;
          }
          throw new Error('Failed to fetch age group analysis');
        }),
        catchError((err) => {
          console.error('Erro ao buscar análise por faixa etária:', err);
          return throwError(() => err);
        })
      );
  }

  getTestDistribution(): Observable<TestDistribution> {
    return this.http
      .get<TestDistribution>(`${this.apiUrl}/test-distribution`, this.getHttpOptions())
      .pipe(
        map((resp: HttpResponse<TestDistribution>) => {
          if (resp.status === 200 && resp.body) {
            return resp.body;
          }
          throw new Error('Failed to fetch test distribution');
        }),
        catchError((err) => {
          console.error('Erro ao buscar distribuição de testes:', err);
          return throwError(() => err);
        })
      );
  }
}
