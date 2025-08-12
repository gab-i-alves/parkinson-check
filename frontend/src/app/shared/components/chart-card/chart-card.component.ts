import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart-card',
  imports: [CommonModule],
  templateUrl: './chart-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartCardComponent {
  @Input() title: string = '';
  @Input() chartType: 'pie' | 'bar' | 'line' = 'bar';
}
