import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TestDetailService } from '../../../services/test-detail.service';
import { PatientStatistics } from '../../../../../core/models/patient-statistics.model';
import { PatientTimeline } from '../../../../../core/models/patient-timeline.model';
import { HistoryTabComponent } from '../../../shared/components/history-tab/history-tab.component';
import { ChartsTabComponent } from '../../../shared/components/charts-tab/charts-tab.component';
import { StatisticsTabComponent } from '../../../shared/components/statistics-tab/statistics-tab.component';
import { UserService } from '../../../../../core/services/user.service';

type TabType = 'charts' | 'history' | 'statistics';

@Component({
  selector: 'app-patient-results',
  standalone: true,
  imports: [
    CommonModule,
    ChartsTabComponent,
    HistoryTabComponent,
    StatisticsTabComponent,
  ],
  templateUrl: './patient-results.component.html',
})
export class PatientResultsComponent implements OnInit {
  private router = inject(Router);
  private testDetailService = inject(TestDetailService);
  private userService = inject(UserService);

  readonly activeTab = signal<TabType>('charts');
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  readonly statistics = signal<PatientStatistics | null>(null);
  readonly timeline = signal<PatientTimeline | null>(null);

  // Get patientId from UserService
  get patientId(): number {
    return this.userService.getCurrentUser()?.id || 0;
  }

  ngOnInit(): void {
    this.loadMyData();
  }

  loadMyData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Carregar estatísticas
    this.testDetailService.getMyTestsStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas:', err);
        this.errorMessage.set(
          'Erro ao carregar seus resultados. Tente novamente mais tarde.'
        );
        this.isLoading.set(false);
      },
    });

    // Carregar timeline
    this.testDetailService.getMyTestsTimeline().subscribe({
      next: (timeline) => {
        this.timeline.set(timeline);
      },
      error: (err) => {
        console.error('Erro ao carregar timeline:', err);
      },
    });
  }

  selectTab(tab: TabType): void {
    this.activeTab.set(tab);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
