import { Routes } from '@angular/router';
import { SpiralTestAirDrawComponent } from './components/spiral-test-air-draw/spiral-test-air-draw.component';

export const SPIRAL_TEST_ROUTES: Routes = [
  {
    path: 'air-draw',
    component: SpiralTestAirDrawComponent,
    title: 'Teste da Espiral - Desenho no Ar',
  },
];
