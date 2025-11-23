import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { SpiralTestService } from '../../../services/spiral-test.service';
import { ClinicalTestService } from '../../../services/clinical-test.service';
import { SpiralTestResponse } from '../../../../../core/models/spiral-test-response.model';
import { ImagePreviewModalComponent } from '../../../../../shared/components/image-preview-modal/image-preview-modal.component';
import { TooltipDirective } from '../../../../../shared/directives/tooltip.directive';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { DoctorDashboardService } from '../../../services/doctor-dashboard.service';
import { BreadcrumbService } from '../../../../../shared/services/breadcrumb.service';
import { WebcamCaptureModalComponent } from '../../../../../shared/components/webcam-capture-modal/webcam-capture-modal.component';

@Component({
  selector: 'app-spiral-test-paper',
  standalone: true,
  imports: [CommonModule, ImagePreviewModalComponent, TooltipDirective, BadgeComponent, WebcamCaptureModalComponent],
  templateUrl: './spiral-test-paper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpiralTestPaperComponent implements OnInit, OnDestroy {
  readonly selectedFile = signal<File | null>(null);
  readonly imagePreviewUrl = signal<string | ArrayBuffer | null>(null);
  readonly uploadStatus = signal<'idle' | 'uploading' | 'success' | 'error'>(
    'idle'
  );
  readonly feedbackMessage = signal<string | null>(null);
  readonly analysisResults = signal<SpiralTestResponse | null>(null);
  readonly showPreviewModal = signal<boolean>(false);
  readonly patientName = signal<string>('Carregando...');

  // Controle de cronômetro
  readonly isDrawing = signal<boolean>(false);
  readonly drawDuration = signal<number>(0);
  readonly elapsedTime = signal<string>('00:00');

  // Controle do modal de webcam
  readonly showWebcamModal = signal<boolean>(false);

  private patientId: string | null = null;
  private isClinicalMode = false;
  private drawStartTime: number = 0;
  private drawEndTime: number = 0;
  private timerInterval: any = null;

  constructor(
    private spiralTestService: SpiralTestService,
    private clinicalTestService: ClinicalTestService,
    private doctorDashboardService: DoctorDashboardService,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Detect context: clinical test (with patientId) vs practice test
    this.patientId = this.route.snapshot.paramMap.get('patientId');
    this.isClinicalMode = !!this.patientId;

    if (this.isClinicalMode && this.patientId) {
      console.log(`Modo clínico ativado para paciente ID: ${this.patientId}`);
      this.loadPatientName(Number(this.patientId));
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private loadPatientName(patientId: number): void {
    this.doctorDashboardService.getPatientsPage(1, 100).subscribe({
      next: (result) => {
        const patient = result.patients.find((p) => +p.id === patientId);
        if (patient) {
          this.patientName.set(patient.name);
          const currentUrl = this.router.url;
          this.breadcrumbService.updateBreadcrumb(currentUrl, patient.name);
        } else {
          this.patientName.set('Paciente não encontrado');
        }
      },
      error: (err) => {
        console.error('Erro ao carregar paciente:', err);
        this.patientName.set('Erro ao carregar nome');
      },
    });
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
        const drawDuration = this.drawDuration(); // Usa duração capturada manualmente
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

  openWebcamCapture(): void {
    this.showWebcamModal.set(true);
  }

  closeWebcamModal(): void {
    this.showWebcamModal.set(false);
  }

  onWebcamPhotoCapture(file: File): void {
    // Processar como se fosse upload de arquivo
    this.selectedFile.set(file);

    // Gerar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreviewUrl.set(e.target?.result || null);
    };
    reader.readAsDataURL(file);

    // Feedback
    this.feedbackMessage.set('Foto capturada com sucesso! Você pode visualizar ou enviar para análise.');
    this.uploadStatus.set('idle');

    // Fechar modal
    this.showWebcamModal.set(false);
  }

  startDrawing(): void {
    this.isDrawing.set(true);
    this.drawStartTime = Date.now();
    this.startTimer();
    this.feedbackMessage.set('Cronômetro iniciado. O paciente pode começar a desenhar.');
  }

  stopDrawing(): void {
    this.isDrawing.set(false);
    this.drawEndTime = Date.now();
    this.stopTimer();

    // Calcular duração final em segundos
    const duration = Math.floor((this.drawEndTime - this.drawStartTime) / 1000);
    this.drawDuration.set(duration);
    this.feedbackMessage.set(`Desenho finalizado! Duração: ${this.elapsedTime()}`);
  }

  restartDrawing(): void {
    this.isDrawing.set(false);
    this.drawStartTime = 0;
    this.drawEndTime = 0;
    this.drawDuration.set(0);
    this.elapsedTime.set('00:00');
    this.stopTimer();
    this.feedbackMessage.set('Cronômetro resetado. Pronto para recomeçar.');
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.drawStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      this.elapsedTime.set(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
