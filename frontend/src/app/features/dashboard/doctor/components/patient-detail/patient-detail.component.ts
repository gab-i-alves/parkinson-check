import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientDetailService } from '../../../services/patient-detail.service';
import { PatientFullProfile } from '../../../../../core/models/patient-full-profile.model';
import { PatientStatus } from '../../../../../core/models/patient.model';
import { PatientStatistics } from '../../../../../core/models/patient-statistics.model';
import { PatientTimeline } from '../../../../../core/models/patient-timeline.model';
import { PatientProfileTabComponent } from '../patient-profile-tab/patient-profile-tab.component';
import { HistoryTabComponent } from '../../../shared/components/history-tab/history-tab.component';
import { StatisticsTabComponent } from '../../../shared/components/statistics-tab/statistics-tab.component';
import { ChartsTabComponent } from '../../../shared/components/charts-tab/charts-tab.component';
import { BreadcrumbService } from '../../../../../shared/services/breadcrumb.service';

type TabType = 'profile' | 'history' | 'statistics' | 'charts';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule,
    PatientProfileTabComponent,
    HistoryTabComponent,
    StatisticsTabComponent,
    ChartsTabComponent,
  ],
  templateUrl: './patient-detail.component.html',
})
export class PatientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientDetailService = inject(PatientDetailService);
  private breadcrumbService = inject(BreadcrumbService);

  readonly patientId = signal<number | null>(null);
  readonly activeTab = signal<TabType>('profile');
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  readonly profile = signal<PatientFullProfile | null>(null);
  readonly statistics = signal<PatientStatistics | null>(null);
  readonly timeline = signal<PatientTimeline | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.patientId.set(Number(id));
      this.loadPatientData(Number(id));
    } else {
      this.errorMessage.set('ID do paciente não fornecido');
      this.isLoading.set(false);
    }
  }

  loadPatientData(patientId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Carregar dados em paralelo
    this.patientDetailService.getPatientProfile(patientId).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isLoading.set(false);

        // Update breadcrumb with patient name
        const currentUrl = this.router.url;
        this.breadcrumbService.updateBreadcrumb(currentUrl, profile.name);
      },
      error: (err) => {
        console.error('Erro ao carregar perfil do paciente:', err);
        this.errorMessage.set(
          'Erro ao carregar dados do paciente. Verifique suas permissões.'
        );
        this.isLoading.set(false);
      },
    });

    this.patientDetailService.getPatientStatistics(patientId).subscribe({
      next: (stats) => {
        this.statistics.set(stats);
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas:', err);
      },
    });

    this.patientDetailService.getPatientTimeline(patientId).subscribe({
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
    this.router.navigate(['/dashboard/doctor/patients']);
  }

  getStatusLabel(status?: PatientStatus): string {
    if (!status) return 'N/A';
    const labels: Record<PatientStatus, string> = {
      stable: 'Estável',
      attention: 'Atenção',
      critical: 'Crítico',
    };
    return labels[status];
  }

  getStatusVariant(status?: PatientStatus): 'success' | 'warning' | 'error' | 'neutral' {
    if (!status) return 'neutral';
    const variants: Record<PatientStatus, 'success' | 'warning' | 'error'> = {
      stable: 'success',
      attention: 'warning',
      critical: 'error',
    };
    return variants[status];
  }
}
