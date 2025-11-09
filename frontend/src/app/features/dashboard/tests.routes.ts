import { Routes } from '@angular/router';
import { TestMethodSelectionComponent } from './patient/components/test-method-selection/test-method-selection.component';

export const TEST_ROUTES: Routes = [
  {
    path: '',
    component: TestMethodSelectionComponent,
  },
  {
    path: 'spiral-test/webcam',
    title: 'Teste da Espiral com Webcam',
    loadComponent: () =>
      import('./tests/components/spiral-test-webcam/spiral-test-webcam.component').then(
        (c) => c.SpiralTestWebcamComponent
      ),
  },
  {
    path: 'spiral-test/paper',
    title: 'Teste da Espiral com Papel',
    loadComponent: () =>
      import('./tests/components/spiral-test-paper/spiral-test-paper.component').then(
        (c) => c.SpiralTestPaperComponent
      ),
  },
  {
    path: 'voice-test',
    title: 'Teste de Voz',
    loadComponent: () =>
      import('./tests/components/voice-test/voice-test.component').then((c) => c.VoiceTestComponent),
  },
  {
    path: 'clinical/spiral/:patientId',
    title: 'Teste Clínico da Espiral',
    loadComponent: () =>
      import('./tests/components/spiral-test-webcam/spiral-test-webcam.component').then(
        (c) => c.SpiralTestWebcamComponent
      ),
  },
  {
    path: 'clinical/voice/:patientId',
    title: 'Teste Clínico de Voz',
    loadComponent: () =>
      import('./tests/components/voice-test/voice-test.component').then((c) => c.VoiceTestComponent),
  },
  {
    path: 'result',
    title: 'Resultado do Teste',
    loadComponent: () =>
      import('./shared/components/test-result/test-result.component').then((c) => c.TestResultComponent),
  },
];
