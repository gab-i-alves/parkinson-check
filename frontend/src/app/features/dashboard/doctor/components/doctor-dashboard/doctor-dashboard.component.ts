import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../../../../shared/components/stat-card/stat-card.component';
import { ChartCardComponent } from '../../../../../shared/components/chart-card/chart-card.component';
import { RouterLink } from '@angular/router';
import { DoctorDashboardService } from '../../../services/doctor-dashboard.service';

interface SummaryStat {
  label: string;
  value: string;
  icon: string;
}

interface PatientAlert {
  id: string;
  name: string;
  alert: string;
  timestamp: string;
}

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ChartCardComponent],
  templateUrl: './doctor-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorDashboardComponent {
  private doctorDashboardService = inject(DoctorDashboardService);

  readonly patients = this.doctorDashboardService.patients;

  readonly isLoading = signal<boolean>(true);

  readonly summaryStats = signal<SummaryStat[]>([
    { label: 'Total de Pacientes', value: '23', icon: 'users' },
    { label: 'Testes para Revisar', value: '8', icon: 'clipboard' },
    { label: 'Alertas Recentes', value: '2', icon: 'alert' },
  ]);

  readonly patientAlerts = signal<PatientAlert[]>([
    {
      id: '1',
      name: 'Carlos Santos',
      alert: 'Queda significativa na pontuação do teste de espiral.',
      timestamp: 'há 2 horas',
    },
    {
      id: '2',
      name: 'Maria Oliveira',
      alert: 'Aumento acentuado no tremor vocal detetado.',
      timestamp: 'há 1 dia',
    },
  ]);

  constructor() {
    setTimeout(() => this.isLoading.set(false), 1000);
  }
}
