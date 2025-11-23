import {
  Component,
  ElementRef,
  ViewChild,
  input,
  output,
  signal,
  AfterViewInit,
  OnDestroy,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { BadgeComponent } from '../badge/badge.component';

@Component({
  selector: 'app-webcam-capture-modal',
  standalone: true,
  imports: [CommonModule, TooltipDirective, BadgeComponent],
  templateUrl: './webcam-capture-modal.component.html',
})
export class WebcamCaptureModalComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  // Inputs/Outputs
  isVisible = input<boolean>(false);
  title = input<string>('Capturar Foto da Espiral');
  close = output<void>();
  photoCapture = output<File>();

  // State signals
  readonly cameraStatus = signal<'initializing' | 'ready' | 'error' | 'no-camera'>('initializing');
  readonly capturedImageUrl = signal<string | null>(null);
  readonly isCaptured = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  private mediaStream: MediaStream | null = null;
  private viewInitialized = false;

  constructor() {
    // Watch for visibility changes to start/stop camera
    effect(() => {
      const visible = this.isVisible();

      if (visible && this.viewInitialized && !this.mediaStream) {
        // Only try to start camera if view is initialized
        console.log('Effect: Attempting to start camera');
        setTimeout(() => {
          if (this.videoElement) {
            this.startCamera();
          }
        }, 100);
      } else if (!visible && this.mediaStream) {
        console.log('Effect: Stopping camera');
        this.stopCamera();
      }
    });
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit called, videoElement available:', !!this.videoElement);
    this.viewInitialized = true;

    if (this.isVisible()) {
      // Start camera after view is fully initialized
      setTimeout(() => {
        console.log('ngAfterViewInit: Starting camera, videoElement:', !!this.videoElement);
        this.startCamera();
      }, 300);
    }
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  async startCamera(): Promise<void> {
    console.log('startCamera called', {
      hasVideoElement: !!this.videoElement,
      hasMediaDevices: !!navigator.mediaDevices
    });

    if (!this.videoElement) {
      console.error('Video element not available yet');
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('MediaDevices API not supported');
      this.cameraStatus.set('no-camera');
      this.errorMessage.set('Seu navegador não suporta acesso à câmera.');
      return;
    }

    try {
      this.cameraStatus.set('initializing');
      console.log('Requesting camera access...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
      });

      console.log('Camera access granted, stream:', stream);

      const video = this.videoElement.nativeElement;
      video.srcObject = stream;
      this.mediaStream = stream;

      await video.play();
      console.log('Video playing');
      this.cameraStatus.set('ready');

    } catch (error: any) {
      console.error('Erro ao acessar câmera:', error);
      this.cameraStatus.set('error');

      if (error.name === 'NotAllowedError') {
        this.errorMessage.set('Permissão de câmera negada. Verifique as configurações do navegador.');
      } else if (error.name === 'NotFoundError') {
        this.errorMessage.set('Nenhuma câmera encontrada no dispositivo.');
      } else if (error.name === 'NotReadableError') {
        this.errorMessage.set('Câmera em uso por outro aplicativo.');
      } else {
        this.errorMessage.set('Não foi possível acessar a câmera: ' + error.message);
      }
    }
  }

  capturePhoto(): void {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const ctx = canvas.getContext('2d')!;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL for preview
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    this.capturedImageUrl.set(imageDataUrl);
    this.isCaptured.set(true);

    // Pause video stream
    if (this.mediaStream) {
      this.mediaStream.getVideoTracks().forEach(track => track.enabled = false);
    }
  }

  retakePhoto(): void {
    this.capturedImageUrl.set(null);
    this.isCaptured.set(false);

    // Resume video stream
    if (this.mediaStream) {
      this.mediaStream.getVideoTracks().forEach(track => track.enabled = true);
    }
  }

  confirmPhoto(): void {
    const canvas = this.canvasElement.nativeElement;

    canvas.toBlob((blob) => {
      if (blob) {
        const timestamp = new Date().getTime();
        const file = new File([blob], `spiral_photo_${timestamp}.jpg`, {
          type: 'image/jpeg'
        });

        this.photoCapture.emit(file);
        this.closeModal();
      }
    }, 'image/jpeg', 0.9);
  }

  closeModal(): void {
    this.stopCamera();
    this.capturedImageUrl.set(null);
    this.isCaptured.set(false);
    this.cameraStatus.set('initializing');
    this.close.emit();
  }

  private stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  onBackdropClick(): void {
    if (!this.isCaptured()) {
      this.closeModal();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !this.isCaptured()) {
      this.closeModal();
    }
  }
}
