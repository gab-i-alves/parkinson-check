import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { RecentTestsListComponent } from '../recent-tests-list/recent-tests-list.component';
import { TestDetailService } from '../../services/test-detail.service';
import { TimelineTestItem } from '../../../../core/models/patient-timeline.model';

interface SummaryStat {
  label: string;
  value: string;
  icon: string;
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
export class PatientDashboardComponent implements OnInit {
  private testDetailService = inject(TestDetailService);

  readonly isLoading = signal<boolean>(true);
  readonly summaryStats = signal<SummaryStat[]>([]);
  readonly recentTests = signal<TimelineTestItem[]>([]);

  ngOnInit(): void {
    this.loadTestsData();
  }

  private loadTestsData(): void {
    this.testDetailService.getMyTestsTimeline().subscribe({
      next: (timeline) => {
        const tests = timeline.tests;

        // Calculate statistics
        const totalTests = tests.length;
        const spiralTests = tests.filter(t => t.test_type === 'SPIRAL_TEST');
        const voiceTests = tests.filter(t => t.test_type === 'VOICE_TEST');

        const avgSpiralScore = spiralTests.length > 0
          ? spiralTests.reduce((sum, t) => sum + t.score, 0) / spiralTests.length
          : 0;

        const avgVoiceScore = voiceTests.length > 0
          ? voiceTests.reduce((sum, t) => sum + t.score, 0) / voiceTests.length
          : 0;

        // Calculate consistency (variance-based metric)
        const consistency = totalTests > 1 ? this.calculateConsistency(tests) : 100;

        // Update summary stats
        this.summaryStats.set([
          {
            label: 'Testes Realizados',
            value: totalTests.toString(),
            icon: 'clipboard'
          },
          {
            label: 'Pontuação Média (Espiral)',
            value: spiralTests.length > 0
              ? `${(avgSpiralScore * 100).toFixed(0)}/100`
              : 'N/A',
            icon: 'spiral'
          },
          {
            label: 'Pontuação Média (Voz)',
            value: voiceTests.length > 0
              ? `${(avgVoiceScore * 100).toFixed(0)}/100`
              : 'N/A',
            icon: 'voice'
          },
          {
            label: 'Consistência dos Testes',
            value: `${consistency.toFixed(0)}%`,
            icon: 'chart'
          },
        ]);

        // Set recent tests (already ordered by date DESC from backend)
        this.recentTests.set(tests.slice(0, 5));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar testes:', err);
        this.isLoading.set(false);
      },
    });
  }

  private calculateConsistency(tests: TimelineTestItem[]): number {
    if (tests.length < 2) return 100;

    const scores = tests.map(t => t.score);
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Convert to percentage (lower variance = higher consistency)
    // Assuming max stdDev of 0.5 maps to 0% consistency
    const consistency = Math.max(0, 100 - (stdDev * 200));
    return consistency;
  }
}
