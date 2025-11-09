import { Routes } from '@angular/router';
import { TestMethodSelectionComponent } from './components/test-method-selection/test-method-selection.component';

export const TEST_ROUTES: Routes = [
  {
    path: '',
    component: TestMethodSelectionComponent,
  },
  {
    path: 'spiral-test/webcam',
    title: 'Teste da Espiral com Webcam',
    loadComponent: () =>
      import('./components/spiral-test-webcam/spiral-test-webcam.component').then(
        (c) => c.SpiralTestWebcamComponent
      ),
  },
  {
    path: 'spiral-test/paper',
    title: 'Teste da Espiral com Papel',
    loadComponent: () =>
      import('./components/spiral-test-paper/spiral-test-paper.component').then(
        (c) => c.SpiralTestPaperComponent
      ),
  },
  {
    path: 'voice-test',
    title: 'Teste de Voz',
    loadComponent: () =>
      import('./components/voice-test/voice-test.component').then((c) => c.VoiceTestComponent),
  },
];
