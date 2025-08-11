import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { RecentTestsListComponent } from '../recent-tests-list/recent-tests-list.component';

interface SummaryStat {
  label: string;
  value: string;
  icon: string;
}

interface RecentTest {
  id: string;
  type: 'Espiral' | 'Voz';
  date: string;
  score: number;
}

@Component({
  selector: 'app-patient-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    StatCardComponent,
    RecentTestsListComponent,
  ],
  templateUrl: './patient-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientDashboardComponent {
  readonly isLoading = signal<boolean>(true);

  readonly summaryStats = signal<SummaryStat[]>([
    { label: 'Testes Realizados', value: '12', icon: 'clipboard' },
    { label: 'Pontuação Média (Espiral)', value: '86/100', icon: 'spiral' },
    { label: 'Pontuação Média (Voz)', value: '78/100', icon: 'voice' },
    { label: 'Consistência dos Testes', value: '92%', icon: 'chart' },
  ]);

  readonly recentTests = signal<RecentTest[]>([
    { id: '1', type: 'Voz', date: '2025-08-05', score: 82 },
    { id: '2', type: 'Espiral', date: '2025-08-04', score: 88 },
  ]);

  constructor() {
    setTimeout(() => this.isLoading.set(false), 1000);
  }
}
