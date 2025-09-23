import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, Observable, catchError, throwError } from 'rxjs';

export interface VoiceTestResponse {
  score: number;
  analysis: string;
}

@Injectable({
  providedIn: 'root',
})
export class VoiceTestService {
  private mediaRecorder: MediaRecorder | undefined;
  private audioChunks: Blob[] = [];
  private recordingSubject = new Subject<Blob>();
  private apiUrl = '/api/tests/voice/practice';

  public get recording$(): Observable<Blob> {
    return this.recordingSubject.asObservable();
  }

  constructor(private http: HttpClient) {}

  uploadVoiceSample(file: File): Observable<VoiceTestResponse> {
    const formData = new FormData();
    formData.append('audio_file', file, file.name);

    return this.http
      .post<VoiceTestResponse>(this.apiUrl, formData)
      .pipe(catchError(this.handleError));
  }

  async startRecording(): Promise<MediaStream | undefined> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.recordingSubject.next(audioBlob);
        this.destroyStream(stream);
      };

      this.mediaRecorder.start();
      console.log('Gravação iniciada.');
      return stream;
    } catch (err) {
      console.error('Erro ao acessar o microfone:', err);
      alert(
        'Não foi possível acessar o microfone. Verifique as permissões do navegador.'
      );
      return undefined;
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      console.log('Gravação parada.');
    }
  }

  private destroyStream(stream: MediaStream): void {
    stream.getTracks().forEach((track) => track.stop());
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage =
      'Ocorreu um erro desconhecido ao processar a solicitação.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      if (error.status === 400) {
        errorMessage =
          'Arquivo de áudio inválido ou corrompido. Por favor, grave novamente.';
      } else if (error.status === 500) {
        errorMessage =
          'Ocorreu um erro inesperado no servidor ao analisar o áudio. Tente novamente mais tarde.';
      } else if (error.error && error.error.detail) {
        errorMessage = error.error.detail;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
