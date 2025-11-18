import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChartCardComponent, ChartData } from '../../../../../shared/components/chart-card/chart-card.component';
import { DoctorDashboardService } from '../../../services/doctor-dashboard.service';
import { Patient, PatientStatus } from '../../../../../core/models/patient.model';
import { ToastService } from '../../../../../shared/services/toast.service';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { TooltipDirective } from '../../../../../shared/directives/tooltip.directive';

interface AggregatedStats {
  totalPatients: number;
  totalTests: number;
  averageScore: number;
  patientsStable: number;
  patientsAttention: number;
  patientsCritical: number;
}

interface FilterOptions {
  status: PatientStatus | 'all';
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
}

@Component({
  selector: 'app-analysis-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ChartCardComponent, BadgeComponent, TooltipDirective],
  templateUrl: './analysis-tab.html',
  styleUrl: './analysis-tab.scss'
})
export class AnalysisTab implements OnInit {
  private doctorDashboardService = inject(DoctorDashboardService);
  private toastService = inject(ToastService);

  readonly isLoading = signal<boolean>(true);
  readonly allPatients = signal<Patient[]>([]);
  readonly currentPage = signal<number>(1);
  readonly pageSize = 10;
  readonly showExportDropdown = signal<boolean>(false);

  readonly filters = signal<FilterOptions>({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });

  readonly stats = signal<AggregatedStats>({
    totalPatients: 0,
    totalTests: 0,
    averageScore: 0,
    patientsStable: 0,
    patientsAttention: 0,
    patientsCritical: 0,
  });

  // Computed signals for filtered data
  readonly filteredPatients = computed(() => {
    let patients = this.allPatients();
    const filter = this.filters();

    if (filter.status !== 'all') {
      patients = patients.filter(p => p.status === filter.status);
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      patients = patients.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term) ||
        p.cpf?.includes(term)
      );
    }

    // Date filtering would go here if lastTestDate was a proper date

    return patients;
  });

  readonly paginatedPatients = computed(() => {
    const patients = this.filteredPatients();
    const start = (this.currentPage() - 1) * this.pageSize;
    return patients.slice(start, start + this.pageSize);
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.filteredPatients().length / this.pageSize)
  );

  readonly statusDistributionData = computed<ChartData>(() => {
    const patients = this.filteredPatients();
    return {
      labels: ['Estáveis', 'Atenção', 'Críticos'],
      datasets: [{
        data: [
          patients.filter(p => p.status === 'stable').length,
          patients.filter(p => p.status === 'attention').length,
          patients.filter(p => p.status === 'critical').length
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
      }]
    };
  });

  readonly testTypeData = computed<ChartData>(() => {
    const patients = this.filteredPatients();
    const spiralCount = patients.filter(p => p.lastTestType === 'spiral').length;
    const voiceCount = patients.filter(p => p.lastTestType === 'voice').length;

    return {
      labels: ['Espiral', 'Voz'],
      datasets: [{
        label: 'Testes por Tipo',
        data: [spiralCount, voiceCount],
        backgroundColor: ['#ec4899', '#3b82f6']
      }]
    };
  });

  readonly testsOverTimeData = computed<ChartData>(() => {
    // Simplified: group by month if we had proper dates
    // For now, return mock temporal data
    return {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [{
        label: 'Total de Testes',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.1)'
      }]
    };
  });

  ngOnInit() {
    this.loadAggregatedData();
  }

  private loadAggregatedData() {
    this.doctorDashboardService.getPatientsPage(1, 1000).subscribe({
      next: (result) => {
        const patients = result.patients;
        this.allPatients.set(patients);

        const totalPatients = patients.length;
        const totalTests = patients.reduce((sum, p) => sum + (p.testsCount || 0), 0);
        const patientsStable = patients.filter(p => p.status === 'stable').length;
        const patientsAttention = patients.filter(p => p.status === 'attention').length;
        const patientsCritical = patients.filter(p => p.status === 'critical').length;

        this.stats.set({
          totalPatients,
          totalTests,
          averageScore: 0, // TODO: calcular quando tiver dados reais
          patientsStable,
          patientsAttention,
          patientsCritical,
        });

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar dados agregados:', err);
        this.toastService.error('Erro ao carregar dados. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  updateFilter(key: keyof FilterOptions, value: string) {
    this.filters.update(f => ({ ...f, [key]: value }));
    this.currentPage.set(1); // Reset to first page on filter change
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
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

  getStatusLabel(status?: PatientStatus): string {
    if (!status) return 'Desconhecido';
    const labels: Record<PatientStatus, string> = {
      stable: 'Estável',
      attention: 'Atenção',
      critical: 'Crítico',
    };
    return labels[status];
  }

  exportCSV() {
    const patients = this.filteredPatients();
    if (patients.length === 0) {
      this.toastService.warning('Nenhum paciente para exportar com os filtros aplicados.');
      return;
    }

    const csvContent = this.generateCSV(patients);
    this.downloadFile(csvContent, 'analise-pacientes.csv', 'text/csv');
    this.toastService.success(`${patients.length} paciente(s) exportado(s) com sucesso!`);
  }

  exportPDF() {
    this.toastService.warning('Funcionalidade de exportação PDF será implementada em breve');
  }

  toggleExportDropdown() {
    this.showExportDropdown.update(val => !val);
  }

  closeExportDropdown() {
    this.showExportDropdown.set(false);
  }

  clearFilters() {
    this.filters.set({
      status: 'all',
      dateFrom: '',
      dateTo: '',
      searchTerm: ''
    });
    this.currentPage.set(1);
    this.toastService.info('Filtros limpos com sucesso');
  }

  removeFilter(key: keyof FilterOptions) {
    this.filters.update(f => ({ ...f, [key]: key === 'status' ? 'all' : '' }));
    this.currentPage.set(1);
  }

  getActiveFiltersCount(): number {
    const f = this.filters();
    let count = 0;
    if (f.status !== 'all') count++;
    if (f.dateFrom) count++;
    if (f.dateTo) count++;
    if (f.searchTerm) count++;
    return count;
  }

  getPatientInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  getStatusLabelForFilter(status: PatientStatus | 'all'): string {
    if (status === 'all') return 'Todos';
    return this.getStatusLabel(status);
  }

  get Math() {
    return Math;
  }

  private generateCSV(patients: any[]): string {
    const headers = ['ID', 'Nome', 'Idade', 'CPF', 'Email', 'Status', 'Total de Testes', 'Último Teste', 'Tipo do Último Teste'];
    const rows = patients.map(p => [
      p.id,
      p.name,
      p.age,
      p.cpf,
      p.email,
      p.status,
      p.testsCount,
      p.lastTestDate,
      p.lastTestType || ''
    ]);

    const csvRows = [headers, ...rows];
    return csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  private downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
