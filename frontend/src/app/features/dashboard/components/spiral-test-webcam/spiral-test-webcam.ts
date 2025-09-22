import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { SpiralTestService } from '../../services/spiral-test.service';
import { SpiralTestResponse } from '../../../../core/models/spiral-test-response.model';

declare const Hands: any;
declare const Camera: any;

@Component({
  selector: 'app-spiral-test-webcam',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spiral-test-webcam.html',
})
export class SpiralTestWebcam implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  private hands: any;
  private camera: any;
  private canvasContext!: CanvasRenderingContext2D;

  private isDrawing = false;
  private userDrawing: { x: number; y: number }[][] = [];

  getModelKeys(results: SpiralTestResponse | null): string[] {
    if (!results) {
      return [];
    }
    return Object.keys(results.model_results);
  }

  readonly uploadStatus = signal<'idle' | 'uploading' | 'success' | 'error'>(
    'idle'
  );
  readonly feedbackMessage = signal<string | null>(null);
  readonly analysisResults = signal<SpiralTestResponse | null>(null);

  constructor(
    private spiralTestService: SpiralTestService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    this.canvasContext = this.canvasElement.nativeElement.getContext('2d')!;
    this.initializeMediaPipe();
    this.startCamera();
  }

  ngOnDestroy(): void {
    this.stopCamera();
    const video = this.videoElement?.nativeElement;
    if (video && video.srcObject) {
      (video.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }
  }

  initializeMediaPipe(): void {
    this.hands = new Hands({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    this.hands.onResults((results: any) => {
      this.processHandResults(results);
    });
  }

  async startCamera(): Promise<void> {
    if (
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      this.feedbackMessage.set(
        'A sua câmera não é suportada por este navegador.'
      );
      this.uploadStatus.set('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
      });
      const video = this.videoElement.nativeElement;
      video.srcObject = stream;

      this.camera = new Camera(video, {
        onFrame: async () => {
          await this.hands.send({ image: video });
        },
        width: 640,
        height: 480,
      });
      this.camera.start();
    } catch (err) {
      console.error('Erro ao acessar a câmera:', err);
      this.feedbackMessage.set(
        'Não foi possível acessar a câmera. Verifique as permissões do seu navegador.'
      );
      this.uploadStatus.set('error');
    }
  }

  stopCamera(): void {
    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }
  }

  processHandResults(results: any): void {
    const canvas = this.canvasElement.nativeElement;
    const ctx = this.canvasContext;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    this.drawGuideSpiral();
    this.redrawUserDrawing();

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const indexTip = landmarks[8];

      const x = (1 - indexTip.x) * canvas.width;
      const y = indexTip.y * canvas.height;

      if (this.isDrawing) {
        const currentPath = this.userDrawing[this.userDrawing.length - 1];
        if (currentPath) {
          currentPath.push({ x, y });
        }
      }
    }
  }

  startDrawing(): void {
    this.isDrawing = true;
    this.userDrawing.push([]);
    this.feedbackMessage.set('Desenhe a espiral seguindo o modelo.');
  }

  stopDrawing(): void {
    this.isDrawing = false;
  }

  redrawUserDrawing(): void {
    const ctx = this.canvasContext;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    this.userDrawing.forEach((path) => {
      if (path.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    });
  }

  clearCanvas(): void {
    this.userDrawing = [];
    this.uploadStatus.set('idle');
    this.feedbackMessage.set(null);
    this.analysisResults.set(null);
  }

  async uploadImage(): Promise<void> {
    this.uploadStatus.set('uploading');
    this.feedbackMessage.set('Enviando desenho para análise...');
    this.analysisResults.set(null);

    const canvas = this.canvasElement.nativeElement;
    const ctx = this.canvasContext;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawGuideSpiral(true);
    this.redrawUserDrawing();

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'spiral.png', { type: 'image/png' });
        try {
          const response = await lastValueFrom(
            this.spiralTestService.uploadSpiralImage(file)
          );
          this.uploadStatus.set('success');
          this.feedbackMessage.set('Análise concluída com sucesso!');
          this.analysisResults.set(response);
          this.stopCamera();
        } catch (error) {
          console.error('Erro ao enviar imagem:', error);
          this.uploadStatus.set('error');
          this.feedbackMessage.set(
            error instanceof Error
              ? error.message
              : 'Ocorreu um erro inesperado.'
          );
        }
      }
    }, 'image/png');
  }

  goBackToMethodSelection(): void {
    this.router.navigate(['/dashboard/tests']);
  }

  drawGuideSpiral(forUpload = false): void {
    const canvas = this.canvasElement.nativeElement;
    const ctx = this.canvasContext;

    ctx.save();
    ctx.strokeStyle = forUpload
      ? 'rgba(0, 0, 0, 0.3)'
      : 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const turns = 2.5;
    const maxRadius = Math.min(canvas.width, canvas.height) / 4;
    const maxAngle = Math.PI * 2 * turns;

    for (let angle = 0; angle <= maxAngle; angle += 0.05) {
      const radius = (maxRadius * angle) / maxAngle;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      angle === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }

    ctx.stroke();
    ctx.restore();
  }
}
