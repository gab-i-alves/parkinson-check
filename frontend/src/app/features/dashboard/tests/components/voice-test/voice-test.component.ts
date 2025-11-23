import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  signal,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import {
  VoiceTestService,
  VoiceTestResponse,
} from '../../../services/voice-test.service';
import { ClinicalTestService } from '../../../services/clinical-test.service';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from '../../../../../shared/directives/tooltip.directive';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { DoctorDashboardService } from '../../../services/doctor-dashboard.service';
import { BreadcrumbService } from '../../../../../shared/services/breadcrumb.service';
import { FeedbackModalComponent } from '../../../../../shared/components/feedback-modal/feedback-modal.component';

@Component({
  selector: 'app-voice-test',
  imports: [CommonModule, TooltipDirective, BadgeComponent, FeedbackModalComponent],
  templateUrl: './voice-test.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoiceTestComponent implements OnInit, OnDestroy {
  readonly isRecording = signal<boolean | null>(false);
  readonly feedbackMessage = signal<string | null>(null);
  readonly analysisResults = signal<VoiceTestResponse | null>(null);
  readonly recordedAudioUrl = signal<SafeUrl | undefined>(undefined);
  readonly isSubmitting = signal<boolean>(false);
  readonly patientName = signal<string>('Carregando...');

  // Feedback modal signals
  readonly showFeedbackModal = signal<boolean>(false);
  readonly feedbackType = signal<'error'>('error');
  readonly feedbackTitle = signal<string>('');
  readonly feedbackModalMessage = signal<string>('');

  private recordedAudioBlob: Blob | undefined;
  private recordingSubscription: Subscription | undefined;
  private recordStartTime: number = 0;

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('audioVisualizer')
  visualizerCanvas!: ElementRef<HTMLCanvasElement>;

  private audioContext: AudioContext | undefined;
  private analyser: AnalyserNode | undefined;
  private animationFrameId: number | undefined;

  // Context detection
  private route = inject(ActivatedRoute);
  private clinicalTestService = inject(ClinicalTestService);
  private doctorDashboardService = inject(DoctorDashboardService);
  private breadcrumbService = inject(BreadcrumbService);
  private patientId: string | null = null;
  private isClinicalMode = false;

  constructor(
    private voiceTestService: VoiceTestService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Detect context: clinical test (with patientId) vs practice test
    this.patientId = this.route.snapshot.paramMap.get('patientId');
    this.isClinicalMode = !!this.patientId;

    if (this.isClinicalMode && this.patientId) {
      console.log(
        `Modo clínico ativado para paciente ID: ${this.patientId}`
      );
      this.loadPatientName(Number(this.patientId));
    }

    this.recordingSubscription = this.voiceTestService.recording$.subscribe(
      (blob) => {
        if (blob.size === 0) {
          this.feedbackMessage.set(
            'A gravação resultou em um arquivo vazio. Tente novamente.'
          );
          return;
        }

        this.recordedAudioBlob = blob;
        const url = URL.createObjectURL(blob);
        this.recordedAudioUrl.set(this.sanitizer.bypassSecurityTrustUrl(url));
      }
    );
  }

  ngOnDestroy(): void {
    this.recordingSubscription?.unsubscribe();
    this.stopVisualization();
  }

  startRecording(): void {
    this.isRecording.set(true);
    this.recordedAudioUrl.set(undefined);
    this.recordedAudioBlob = undefined;
    this.analysisResults.set(null);
    this.feedbackMessage.set(null);
    this.recordStartTime = Date.now();

    this.voiceTestService.startRecording()
      .then((stream) => {
        if (stream) {
          this.initVisualizer(stream);
        }
      })
      .catch((error) => {
        console.error('Erro ao iniciar gravação:', error);
        this.isRecording.set(false);
        this.feedbackTitle.set('Erro de Microfone');
        this.feedbackModalMessage.set(error.message || 'Não foi possível acessar o microfone.');
        this.feedbackType.set('error');
        this.showFeedbackModal.set(true);
      });
  }

  stopRecording(): void {
    this.isRecording.set(false);
    this.voiceTestService.stopRecording();
    this.stopVisualization();
  }

  async playRecording(): Promise<void> {
    if (this.audioPlayer) {
      try {
        await this.audioPlayer.nativeElement.play();
      } catch (error) {
        console.error('Erro ao tocar o áudio:', error);
        this.feedbackTitle.set('Erro ao tocar áudio');
        this.feedbackModalMessage.set('Não foi possível tocar o áudio. Verifique as configurações do navegador.');
        this.feedbackType.set('error');
        this.showFeedbackModal.set(true);
      }
    }
  }

  uploadAudio(): void {
    if (!this.recordedAudioBlob) {
      this.feedbackMessage.set(
        'Nenhum áudio para enviar. Grave um áudio primeiro.'
      );
      return;
    }

    if (this.recordedAudioBlob.size === 0) {
      this.feedbackMessage.set(
        'A gravação resultou em um arquivo vazio. Tente novamente.'
      );
      return;
    }

    this.isSubmitting.set(true);
    this.feedbackMessage.set(null);

    const fileName = `gravacao-${Date.now()}.webm`;
    const audioFile = new File([this.recordedAudioBlob], fileName, {
      type: 'audio/webm',
    });

    if (this.isClinicalMode && this.patientId) {
      // Clinical mode: use ClinicalTestService
      const recordDuration = Math.floor((Date.now() - this.recordStartTime) / 1000);

      this.clinicalTestService
        .processVoiceTest(Number(this.patientId), audioFile, recordDuration)
        .pipe(finalize(() => this.isSubmitting.set(false)))
        .subscribe({
          next: (response) => {
            this.analysisResults.set(response);
            this.recordedAudioUrl.set(undefined);

            // Navegar para resultado clínico
            this.router.navigate(['/dashboard/doctor/clinical-test/result'], {
              state: {
                result: response,
                testType: 'voice',
              },
            });

          },
          error: (err) => {
            this.feedbackMessage.set(`Erro na análise: ${err.message}`);
            console.error(err);
          },
        });
    } else {
      // Practice mode: use VoiceTestService
      this.voiceTestService
        .uploadVoiceSample(audioFile)
        .pipe(finalize(() => this.isSubmitting.set(false)))
        .subscribe({
          next: (response) => {
            // Navegar para página de resultado
            this.router.navigate(['/dashboard/tests/result'], {
              state: {
                result: response,
                testType: 'voice',
                isPracticeMode: true,
              },
            });
          },
          error: (err) => {
            this.feedbackMessage.set(`Erro na análise: ${err.message}`);
            console.error(err);
          },
        });
    }
  }

  cancelRecording(): void {
    this.recordedAudioUrl.set(undefined);
    this.recordedAudioBlob = undefined;
    this.analysisResults.set(null);
    this.feedbackMessage.set(null);
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

  private initVisualizer(stream: MediaStream): void {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    const source = this.audioContext.createMediaStreamSource(stream);

    source.connect(this.analyser);
    this.analyser.fftSize = 256;

    this.draw();
  }

  private draw(): void {
    if (!this.analyser || !this.isRecording()) return;

    const canvas = this.visualizerCanvas.nativeElement;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = '#fafafa';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 1.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2;
      canvasCtx.fillStyle = `rgb(219, 39, 119, ${barHeight / 100})`; // pink-600
      canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }

    this.animationFrameId = requestAnimationFrame(() => this.draw());
  }

  private stopVisualization(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.audioContext?.close();
  }

  goBackToMethodSelection(): void {
    if (this.isClinicalMode) {
      // Clinical mode: go back to doctor dashboard
      this.router.navigate(['/dashboard/doctor']);
    } else {
      // Practice mode: go back to test selection
      this.router.navigate(['/dashboard/tests']);
    }
  }
}
