import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { SpiralTestService } from '../../../services/spiral-test.service';
import { SpiralTestResponse } from '../../../../../core/models/spiral-test-response.model';

@Component({
  selector: 'app-spiral-test-paper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spiral-test-paper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpiralTestPaperComponent {
  readonly selectedFile = signal<File | null>(null);
  readonly imagePreviewUrl = signal<string | ArrayBuffer | null>(null);
  readonly uploadStatus = signal<'idle' | 'uploading' | 'success' | 'error'>(
    'idle'
  );
  readonly feedbackMessage = signal<string | null>(null);
  readonly analysisResults = signal<SpiralTestResponse | null>(null);

  constructor(
    private spiralTestService: SpiralTestService,
    private router: Router
  ) {}

  getModelKeys(results: SpiralTestResponse | null): string[] {
    if (!results) {
      return [];
    }
    return Object.keys(results.model_results);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type.startsWith('image/')) {
        this.selectedFile.set(file);
        this.feedbackMessage.set(null);
        this.uploadStatus.set('idle');
        this.analysisResults.set(null);

        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreviewUrl.set(e.target?.result || null);
        };
        reader.readAsDataURL(file);
      } else {
        this.selectedFile.set(null);
        this.imagePreviewUrl.set(null);
        this.feedbackMessage.set(
          'Por favor, selecione um arquivo de imagem (JPEG, PNG).'
        );
        this.uploadStatus.set('error');
        this.analysisResults.set(null);
      }
    } else {
      this.resetUpload();
    }
  }

  async uploadImage(): Promise<void> {
    const file = this.selectedFile();
    if (!file) {
      this.feedbackMessage.set(
        'Por favor, selecione uma imagem antes de enviar.'
      );
      this.uploadStatus.set('error');
      return;
    }

    this.uploadStatus.set('uploading');
    this.feedbackMessage.set('Enviando imagem para análise...');
    this.analysisResults.set(null);

    try {
      const response = await lastValueFrom(
        this.spiralTestService.uploadSpiralImage(file)
      );

      this.uploadStatus.set('success');
      this.feedbackMessage.set('Análise concluída com sucesso!');
      this.analysisResults.set(response);
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      this.uploadStatus.set('error');
      this.feedbackMessage.set(
        error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'
      );
    }
  }

  resetUpload(): void {
    this.selectedFile.set(null);
    this.imagePreviewUrl.set(null);
    this.uploadStatus.set('idle');
    this.feedbackMessage.set(null);
    this.analysisResults.set(null);
    const fileInput = document.getElementById(
      'spiralImageUpload'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  goBackToMethodSelection(): void {
    this.router.navigate(['/dashboard/tests']);
  }
}
