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

  /**
   * Busca a imagem da espiral de um teste específico (médico).
   * Retorna um Blob que pode ser convertido em URL para exibição.
   */
  getSpiralImage(testId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/tests/test/${testId}/spiral-image`, {
      responseType: 'blob',
      withCredentials: true,
    });
  }

  /**
   * Busca o áudio de voz de um teste específico (médico).
   * Retorna um Blob que pode ser convertido em URL para reprodução.
   */
  getVoiceAudio(testId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/tests/test/${testId}/voice-audio`, {
      responseType: 'blob',
      withCredentials: true,
    });
  }

  /**
   * Busca a imagem da espiral de um teste do próprio paciente.
   * Retorna um Blob que pode ser convertido em URL para exibição.
   */
  getMySpiralImage(testId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/tests/my-tests/${testId}/spiral-image`, {
      responseType: 'blob',
      withCredentials: true,
    });
  }

  /**
   * Busca o áudio de voz de um teste do próprio paciente.
   * Retorna um Blob que pode ser convertido em URL para reprodução.
   */
  getMyVoiceAudio(testId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/tests/my-tests/${testId}/voice-audio`, {
      responseType: 'blob',
      withCredentials: true,
    });
  }

  /**
   * Faz download da imagem da espiral (médico).
   * Cria um link temporário e aciona o download automaticamente.
   */
  downloadSpiralImage(testId: number): void {
    this.getSpiralImage(testId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `espiral-teste-${testId}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erro ao baixar imagem:', error);
      },
    });
  }

  /**
   * Faz download do áudio de voz (médico).
   * Cria um link temporário e aciona o download automaticamente.
   */
  downloadVoiceAudio(testId: number): void {
    this.getVoiceAudio(testId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audio-teste-${testId}.webm`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erro ao baixar áudio:', error);
      },
    });
  }

  /**
   * Faz download da imagem da espiral (paciente - próprio teste).
   * Cria um link temporário e aciona o download automaticamente.
   */
  downloadMySpiralImage(testId: number): void {
    this.getMySpiralImage(testId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `espiral-teste-${testId}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erro ao baixar imagem:', error);
      },
    });
  }

  /**
   * Faz download do áudio de voz (paciente - próprio teste).
   * Cria um link temporário e aciona o download automaticamente.
   */
  downloadMyVoiceAudio(testId: number): void {
    this.getMyVoiceAudio(testId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audio-teste-${testId}.webm`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erro ao baixar áudio:', error);
      },
    });
  }
}
