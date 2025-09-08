import { Routes } from '@angular/router';
import { TestMethodSelectionComponent } from './test-method-selection';

export const TEST_ROUTES: Routes = [
  {
    path: '',
    component: TestMethodSelectionComponent,
  },
  {
    path: 'spiral-test/webcam',
    title: 'Teste da Espiral com Webcam',
    loadComponent: () =>
      import('../spiral-test-webcam/spiral-test-webcam').then(
        (c) => c.SpiralTestWebcam
      ),
  },
  {
    path: 'spiral-test/paper',
    title: 'Teste da Espiral com Papel',
    loadComponent: () =>
      import('../spiral-test-paper/spiral-test-paper.component').then(
        (c) => c.SpiralTestPaperComponent
      ),
  },
  {
    path: 'voice-test',
    title: 'Teste de Voz',
    loadComponent: () =>
      import('../voice-test/voice-test').then((c) => c.VoiceTest),
  },
];
