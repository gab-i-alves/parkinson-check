import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { SpiralTestResponse } from '../../../core/models/spiral-test-response.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SpiralTestService {
  private apiUrl = `${environment.apiUrl}/tests/spiral/practice`;

  constructor(private http: HttpClient) {}

  uploadSpiralImage(file: File): Observable<SpiralTestResponse> {
    const formData = new FormData();
    formData.append('image', file, file.name);

    return this.http
      .post<SpiralTestResponse>(this.apiUrl, formData, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage =
      'Ocorreu um erro desconhecido ao processar a solicitação.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      if (error.status === 400) {
        errorMessage =
          'Arquivo de imagem inválido ou corrompido. Por favor, verifique o arquivo e tente novamente.';
      } else if (error.status === 500) {
        errorMessage =
          'Ocorreu um erro inesperado no servidor ao analisar a imagem. Tente novamente mais tarde.';
      } else if (error.error && error.error.detail) {
        errorMessage = error.error.detail;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
