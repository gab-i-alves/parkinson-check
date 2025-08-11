import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface RecentTest {
  id: string;
  type: 'Espiral' | 'Voz';
  date: string;
  score: number;
}

@Component({
  selector: 'app-recent-tests-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recent-tests-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentTestsListComponent {
  tests = input.required<RecentTest[]>();
}
