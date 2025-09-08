import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

type TestType = 'spiral' | 'voice';
type SpiralMethod = 'webcam' | 'paper';
type SelectionStep = 'main' | 'spiral';

@Component({
  selector: 'app-test-method-selection',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './test-method-selection.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestMethodSelectionComponent {
  readonly selectionStep = signal<SelectionStep>('main');

  readonly selectedTest = signal<TestType | null>(null);

  readonly selectedSpiralMethod = signal<SpiralMethod | null>(null);

  constructor(private router: Router) {}

  selectTest(test: TestType): void {
    this.selectedTest.set(test);
    if (test === 'spiral') {
      this.selectionStep.set('spiral');
    } else if (test === 'voice') {
      this.router.navigate(['/dashboard/voice-test']);
    }
  }

  selectSpiralMethod(method: SpiralMethod): void {
    this.selectedSpiralMethod.set(method);
  }

  proceedToSpiralTest(): void {
    const method = this.selectedSpiralMethod();
    if (method === 'webcam') {
      this.router.navigate(['/dashboard/spiral-test/webcam']);
    } else if (method === 'paper') {
      this.router.navigate(['/dashboard/spiral-test/paper']);
    }
  }

  goBack(): void {
    this.selectionStep.set('main');
    this.selectedTest.set(null);
    this.selectedSpiralMethod.set(null);
  }
}
