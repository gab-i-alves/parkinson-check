import { Injectable, WritableSignal, signal } from '@angular/core';
import cv, { type Mat, type Scalar } from 'opencv-ts';

export type VisionServiceState = 'loading' | 'ready' | 'error' | 'processing';
export interface Point {
  x: number;
  y: number;
}

@Injectable({ providedIn: 'root' })
export class VisionService {
  state: WritableSignal<VisionServiceState> = signal('loading');

  private targetHue: number | null = null;
  private hsvColorTolerance = 10;

  constructor() {
    this.initOpenCV();
  }

  private async initOpenCV(): Promise<void> {
    try {
      await cv.onRuntimeInitialized;
      this.state.set('ready');
      console.log('OpenCV.js is ready.');
    } catch (error) {
      this.state.set('error');
      console.error('Error initializing OpenCV.js:', error);
    }
  }

  public calibrateColor(frame: Mat, point: Point): void {
    const hsvFrame = new cv.Mat();
    cv.cvtColor(frame, hsvFrame, cv.COLOR_RGB2HSV);

    const pixel = hsvFrame.ucharPtr(point.y, point.x);
    this.targetHue = pixel[0];
    console.log(`Color calibrated. Target HUE: [${this.targetHue}]`);

    hsvFrame.delete();
  }

  public isCalibrated(): boolean {
    return this.targetHue !== null;
  }

  public findFingerTip(frame: Mat): Point | null {
    if (this.state() !== 'ready' || !this.isCalibrated()) {
      return null;
    }

    const hsvFrame = new cv.Mat();
    cv.cvtColor(frame, hsvFrame, cv.COLOR_RGB2HSV);

    const lowerBound = new cv.Scalar(
      this.targetHue! - this.hsvColorTolerance,
      100,
      100
    );
    const upperBound = new cv.Scalar(
      this.targetHue! + this.hsvColorTolerance,
      255,
      255
    );
    const mask = new cv.Mat();

    cv.inRange(hsvFrame, lowerBound as any, upperBound as any, mask);

    const kernel = cv.getStructuringElement(
      cv.MORPH_RECT,
      new cv.Size(5, 5),
      new cv.Point(-1, -1)
    );
    const anchor = new cv.Point(-1, -1);

    cv.morphologyEx(
      mask,
      mask,
      cv.MORPH_OPEN,
      kernel,
      anchor,
      1,
      cv.BORDER_CONSTANT,
      cv.morphologyDefaultBorderValue()
    );
    cv.morphologyEx(
      mask,
      mask,
      cv.MORPH_CLOSE,
      kernel,
      anchor,
      1,
      cv.BORDER_CONSTANT,
      cv.morphologyDefaultBorderValue()
    );

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(
      mask,
      contours,
      hierarchy,
      cv.RETR_CCOMP,
      cv.CHAIN_APPROX_SIMPLE
    );

    let maxArea = 0;
    let bestContourIndex = -1;
    for (let i = 0; i < contours.size(); ++i) {
      const area = cv.contourArea(contours.get(i));
      if (area > maxArea) {
        maxArea = area;
        bestContourIndex = i;
      }
    }

    let trackedPoint: Point | null = null;
    if (bestContourIndex > -1) {
      const bestContour = contours.get(bestContourIndex);
      const moments = cv.moments(bestContour);
      const centerX = Math.round(moments.m10 / moments.m00);
      const centerY = Math.round(moments.m01 / moments.m00);

      if (!isNaN(centerX) && !isNaN(centerY)) {
        trackedPoint = { x: centerX, y: centerY };
        cv.circle(
          frame,
          new cv.Point(centerX, centerY),
          10,
          new cv.Scalar(0, 255, 0, 255),
          2
        );
      }
      bestContour.delete();
    }

    // Liberar memória
    hsvFrame.delete();
    mask.delete();
    kernel.delete();
    contours.delete();
    hierarchy.delete();

    return trackedPoint;
  }
}
