import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    imageUrl: string;
    analysisResult: any;
  };
}

class SpiralTestService {
  uploadSpiralImage(file: File): Promise<UploadResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (file.type.startsWith('image/')) {
          resolve({
            success: true,
            message: 'Imagem enviada com sucesso para análise!',
            data: {
              imageUrl: URL.createObjectURL(file),
              analysisResult: {
                tremorScore: Math.floor(Math.random() * 100),
                smoothness: Math.random().toFixed(2),
              },
            },
          });
        } else {
          resolve({
            success: false,
            message: 'O arquivo selecionado não é uma imagem válida.',
          });
        }
      }, 2000);
    });
  }
}

@Component({
  selector: 'app-spiral-test-paper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spiral-test-paper.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SpiralTestService],
})
export class SpiralTestPaperComponent {
  readonly selectedFile = signal<File | null>(null);
  readonly imagePreviewUrl = signal<string | ArrayBuffer | null>(null);
  readonly uploadStatus = signal<'idle' | 'uploading' | 'success' | 'error'>(
    'idle'
  );
  readonly feedbackMessage = signal<string | null>(null);
  readonly analysisResults = signal<any | null>(null);

  constructor(
    private spiralTestService: SpiralTestService,
    private router: Router
  ) {}

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
      this.selectedFile.set(null);
      this.imagePreviewUrl.set(null);
      this.feedbackMessage.set(null);
      this.uploadStatus.set('idle');
      this.analysisResults.set(null);
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

    try {
      const response = await this.spiralTestService.uploadSpiralImage(file);
      if (response.success) {
        this.uploadStatus.set('success');
        this.feedbackMessage.set(response.message);
        this.analysisResults.set(response.data?.analysisResult || null);
      } else {
        this.uploadStatus.set('error');
        this.feedbackMessage.set(response.message);
      }
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      this.uploadStatus.set('error');
      this.feedbackMessage.set(
        'Ocorreu um erro inesperado ao enviar a imagem. Tente novamente.'
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
