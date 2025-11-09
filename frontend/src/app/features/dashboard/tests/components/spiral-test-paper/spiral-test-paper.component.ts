import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { SpiralTestService } from '../../../services/spiral-test.service';
import { ClinicalTestService } from '../../../services/clinical-test.service';
import { SpiralTestResponse } from '../../../../../core/models/spiral-test-response.model';
import { ImagePreviewModalComponent } from '../../../../../shared/components/image-preview-modal/image-preview-modal.component';

@Component({
  selector: 'app-spiral-test-paper',
  standalone: true,
  imports: [CommonModule, ImagePreviewModalComponent],
  templateUrl: './spiral-test-paper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpiralTestPaperComponent implements OnInit {
  readonly selectedFile = signal<File | null>(null);
  readonly imagePreviewUrl = signal<string | ArrayBuffer | null>(null);
  readonly uploadStatus = signal<'idle' | 'uploading' | 'success' | 'error'>(
    'idle'
  );
  readonly feedbackMessage = signal<string | null>(null);
  readonly analysisResults = signal<SpiralTestResponse | null>(null);
  readonly showPreviewModal = signal<boolean>(false);

  private patientId: string | null = null;
  private isClinicalMode = false;

  constructor(
    private spiralTestService: SpiralTestService,
    private clinicalTestService: ClinicalTestService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Detect context: clinical test (with patientId) vs practice test
    this.patientId = this.route.snapshot.paramMap.get('patientId');
    this.isClinicalMode = !!this.patientId;

    if (this.isClinicalMode) {
      console.log(`Modo clínico ativado para paciente ID: ${this.patientId}`);
    }
  }

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

    try {
      let response: any;

      if (this.isClinicalMode && this.patientId) {
        // Clinical mode: use ClinicalTestService
        const drawDuration = 0; // Paper uploads have no draw duration
        const method = 1; // PAPER method

        response = await lastValueFrom(
          this.clinicalTestService.processSpiralTest(
            Number(this.patientId),
            file,
            drawDuration,
            method
          )
        );
      } else {
        // Practice mode: use SpiralTestService
        response = await lastValueFrom(
          this.spiralTestService.uploadSpiralImage(file)
        );
      }

      this.uploadStatus.set('success');
      this.feedbackMessage.set('Análise concluída com sucesso!');

      // Navigate to result page
      if (this.isClinicalMode) {
        this.router.navigate(['/dashboard/doctor/clinical-test/result'], {
          state: {
            result: response,
            testType: 'spiral',
          },
        });
      } else {
        this.router.navigate(['/dashboard/tests/result'], {
          state: {
            result: response,
            testType: 'spiral',
            isPracticeMode: true,
          },
        });
      }
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
    if (this.isClinicalMode && this.patientId) {
      // Clinical mode: go back to method selection
      this.router.navigate(['/dashboard/doctor/clinical-test/spiral-method-selection', this.patientId]);
    } else {
      // Practice mode: go back to test selection
      this.router.navigate(['/dashboard/tests']);
    }
  }

  openPreviewModal(): void {
    this.showPreviewModal.set(true);
  }

  closePreviewModal(): void {
    this.showPreviewModal.set(false);
  }
}
