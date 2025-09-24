import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import {
  VoiceTestService,
  VoiceTestResponse,
} from '../../services/voice-test.service';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-voice-test',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './voice-test.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoiceTest implements OnInit, OnDestroy {
  readonly isRecording = signal<boolean | null>(false);
  readonly feedbackMessage = signal<string | null>(null);
  readonly analysisResults = signal<VoiceTestResponse | null>(null);
  readonly recordedAudioUrl = signal<SafeUrl | undefined>(undefined);

  private recordedAudioBlob: Blob | undefined;
  private recordingSubscription: Subscription | undefined;

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('audioVisualizer')
  visualizerCanvas!: ElementRef<HTMLCanvasElement>;

  private audioContext: AudioContext | undefined;
  private analyser: AnalyserNode | undefined;
  private animationFrameId: number | undefined;

  constructor(
    private voiceTestService: VoiceTestService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit(): void {
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

    this.voiceTestService.startRecording().then((stream) => {
      if (stream) {
        this.initVisualizer(stream);
      }
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
        alert(
          'Não foi possível tocar o áudio. Verifique as configurações do navegador.'
        );
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

    this.feedbackMessage.set('Analisando seu áudio, por favor aguarde...');

    const fileName = `gravacao-${Date.now()}.webm`;
    const audioFile = new File([this.recordedAudioBlob], fileName, {
      type: 'audio/webm',
    });

    this.voiceTestService
      .uploadVoiceSample(audioFile)
      .pipe(finalize(() => this.feedbackMessage.set(null)))
      .subscribe({
        next: (response) => {
          this.analysisResults.set(response);
          this.recordedAudioUrl.set(undefined);
        },
        error: (err) => {
          this.feedbackMessage.set(`Erro na análise: ${err.message}`);
          console.error(err);
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

    canvasCtx.fillStyle = '#f3f4f6'; 
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 1.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2;
      canvasCtx.fillStyle = `rgb(109, 40, 217, ${barHeight / 100})`;
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
    this.router.navigate(['/dashboard/tests']);
  }
}
