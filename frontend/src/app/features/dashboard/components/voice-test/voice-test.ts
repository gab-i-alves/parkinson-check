import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { VoiceTestService } from '../../services/voice-test.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-voice-test',
  imports: [CommonModule],
  templateUrl: './voice-test.html',
})
export class VoiceTest implements OnInit, OnDestroy {
  readonly isRecording = signal<boolean | null>(false);
  readonly feedbackMessage = signal<string | null>(null);
  readonly analysisResults = signal<null>(null);
  readonly recordedAudioUrl = signal<SafeUrl | undefined>(undefined);
  private recordedAudioBlob: Blob | undefined;
  recordingSubscription: Subscription | undefined;

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  constructor(
    private voiceTestService: VoiceTestService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Componente inicializado. Esperando por gravação...');
    this.recordingSubscription = this.voiceTestService.recording$.subscribe(
      (blob) => {
        // Adicione este log para verificar se o blob está sendo recebido
        console.log('Áudio recebido! Tamanho do Blob:', blob.size, 'bytes.');

        // Verifique se o blob não está vazio
        if (blob.size === 0) {
          console.error('O arquivo de áudio gravado está vazio.');
          return;
        }

        this.recordedAudioBlob = blob;
        const url = URL.createObjectURL(blob);
        this.recordedAudioUrl.set(this.sanitizer.bypassSecurityTrustUrl(url));
      }
    );
  }

  ngOnDestroy(): void {
    if (this.recordingSubscription) {
      this.recordingSubscription.unsubscribe();
    }
  }

  startRecording(): void {
    this.isRecording.set(true);
    this.recordedAudioUrl.set(undefined);
    this.recordedAudioBlob = undefined;
    this.voiceTestService.startRecording();
  }

  stopRecording(): void {
    this.isRecording.set(false);
    this.voiceTestService.stopRecording();
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
    if (this.recordedAudioBlob) {
      const fileName = `gravacao-${Date.now()}.webm`;

      const audioFile = new File([this.recordedAudioBlob], fileName, {
        type: 'audio/webm',
        lastModified: Date.now(),
      });

      this.voiceTestService.uploadVoiceSample(audioFile);
    } else {
      console.log('Nenhum áudio para enviar. Grave um áudio primeiro.');
    }
  }

  goBackToMethodSelection(): void {
    this.router.navigate(['/dashboard/tests']);
  }
}
