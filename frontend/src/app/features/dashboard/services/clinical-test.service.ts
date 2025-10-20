import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import {
  ClinicalSpiralTestResult,
  ClinicalVoiceTestResult,
} from '../../../core/models/clinical-test-result.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClinicalTestService {
  private apiUrl = `${environment.apiUrl}/tests/clinical`;

  constructor(private http: HttpClient) {}

  /**
   * Processa teste de espiral clínico para um paciente.
   *
   * @param patientId ID do paciente que realizará o teste
   * @param imageFile Arquivo de imagem da espiral
   * @param drawDuration Duração do desenho em segundos
   * @param method Método usado (1=PAPER, 2=WEBCAM)
   * @returns Observable com resultado detalhado do teste
   */
  processSpiralTest(
    patientId: number,
    imageFile: File,
    drawDuration: number,
    method: number
  ): Observable<ClinicalSpiralTestResult> {
    const formData = new FormData();
    formData.append('patient_id', patientId.toString());
    formData.append('image', imageFile, imageFile.name);
    formData.append('draw_duration', drawDuration.toString());
    formData.append('method', method.toString());

    return this.http
      .post<ClinicalSpiralTestResult>(`${this.apiUrl}/spiral/process`, formData, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Processa teste de voz clínico para um paciente.
   *
   * @param patientId ID do paciente que realizará o teste
   * @param audioFile Arquivo de áudio
   * @param recordDuration Duração da gravação em segundos
   * @returns Observable com resultado detalhado do teste
   */
  processVoiceTest(
    patientId: number,
    audioFile: File,
    recordDuration: number
  ): Observable<ClinicalVoiceTestResult> {
    const formData = new FormData();
    formData.append('patient_id', patientId.toString());
    formData.append('audio_file', audioFile, audioFile.name);
    formData.append('record_duration', recordDuration.toString());

    return this.http
      .post<ClinicalVoiceTestResult>(`${this.apiUrl}/voice/process`, formData, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage =
      'Ocorreu um erro desconhecido ao processar a solicitação.';

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      if (error.status === 400) {
        errorMessage =
          'Dados inválidos. Por favor, verifique as informações e tente novamente.';
      } else if (error.status === 403) {
        errorMessage =
          'Você não tem permissão para realizar este teste para este paciente.';
      } else if (error.status === 404) {
        errorMessage = 'Paciente não encontrado ou não vinculado a você.';
      } else if (error.status === 500) {
        errorMessage =
          'Ocorreu um erro inesperado no servidor. Tente novamente mais tarde.';
      } else if (error.error && error.error.detail) {
        errorMessage = error.error.detail;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
