import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  inject,
  WritableSignal,
  signal,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisionService, Point } from '../../services/vision.service';
import cv, { type Mat } from 'opencv-ts';

type TestState = 'idle' | 'starting' | 'calibrating' | 'drawing' | 'finished';

@Component({
  selector: 'app-spiral-test-air-draw',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spiral-test-air-draw.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpiralTestAirDrawComponent implements OnDestroy {
  visionService = inject(VisionService);

  @ViewChild('videoElement') videoElement?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement?: ElementRef<HTMLCanvasElement>;
  @ViewChild('drawingCanvasElement')
  drawingCanvasElement?: ElementRef<HTMLCanvasElement>;

  testState: WritableSignal<TestState> = signal('idle');

  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private capture: any | null = null;
  private currentFrame: Mat | null = null;

  constructor() {
    afterNextRender(() => {
      if (this.visionService.state() === 'loading') {
        console.log('Waiting for OpenCV to be ready...');
      }
    });
  }

  async startCamera(): Promise<void> {
    if (this.stream) return;

    this.testState.set('starting');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      const video = this.videoElement?.nativeElement;
      if (!video) return;

      video.srcObject = this.stream;

      video.onloadedmetadata = () => {
        video.play();
        this.capture = new cv.VideoCapture(video);
        this.currentFrame = new cv.Mat(video.height, video.width, cv.CV_8UC4);

        this.animationFrameId = requestAnimationFrame(
          this.processVideo.bind(this)
        );
        this.testState.set('calibrating');
      };
    } catch (err) {
      console.error('Error accessing webcam:', err);
      this.testState.set('idle');
    }
  }

  private processVideo(): void {
    if (!this.capture || !this.currentFrame) {
      this.animationFrameId = requestAnimationFrame(
        this.processVideo.bind(this)
      );
      return;
    }

    try {
      this.capture.read(this.currentFrame);

      if (this.currentFrame.empty()) {
        this.animationFrameId = requestAnimationFrame(
          this.processVideo.bind(this)
        );
        return;
      }

      if (this.visionService.isCalibrated() && this.testState() === 'drawing') {
        const trackedPoint = this.visionService.findFingerTip(
          this.currentFrame
        );
        if (trackedPoint) {
          this.drawOnCanvas(trackedPoint);
        }
      }

      cv.imshow(this.canvasElement!.nativeElement, this.currentFrame);
    } catch (error) {
      console.error('Error during video processing:', error);
    }

    this.animationFrameId = requestAnimationFrame(this.processVideo.bind(this));
  }

  onCanvasClick(event: MouseEvent): void {
    if (this.testState() !== 'calibrating' || !this.currentFrame) return;

    const canvas = this.canvasElement!.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((event.clientX - rect.left) * scaleX);
    const y = Math.round((event.clientY - rect.top) * scaleY);

    this.visionService.calibrateColor(this.currentFrame, { x, y });
    this.testState.set('drawing');
  }

  private drawOnCanvas(point: Point): void {
    const ctx = this.drawingCanvasElement?.nativeElement.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0055d4';
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }

  stopCamera(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.capture?.delete();
    this.currentFrame?.delete();
    this.capture = null;
    this.currentFrame = null;
    this.testState.set('idle');
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }
}
