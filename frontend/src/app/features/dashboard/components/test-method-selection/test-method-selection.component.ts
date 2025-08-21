import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

type TestMethod = 'webcam' | 'paper';

@Component({
  selector: 'app-test-method-selection',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './test-method-selection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestMethodSelectionComponent {
  readonly selectedMethod = signal<TestMethod | null>(null);

  constructor(private router: Router) {}

  selectMethod(method: TestMethod): void {
    this.selectedMethod.set(method);
    if (method === 'webcam') {
      // this.router.navigate(['/dashboard/spiral-test/webcam']);
      console.log('Navegar para o teste com webcam');
    } else if (method === 'paper') {
      // this.router.navigate(['/dashboard/spiral-test/paper']);
      console.log('Navegar para o teste com papel');
    }
  }
}
