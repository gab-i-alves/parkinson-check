import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartCardComponent } from '../../../../../shared/components/chart-card/chart-card.component';
import { DoctorDashboardService } from '../../../services/doctor-dashboard.service';

interface AggregatedStats {
  totalPatients: number;
  totalTests: number;
  averageScore: number;
  patientsStable: number;
  patientsAttention: number;
  patientsCritical: number;
}

@Component({
  selector: 'app-analysis-tab',
  standalone: true,
  imports: [CommonModule, ChartCardComponent],
  templateUrl: './analysis-tab.html',
  styleUrl: './analysis-tab.scss'
})
export class AnalysisTab implements OnInit {
  private doctorDashboardService = inject(DoctorDashboardService);

  readonly isLoading = signal<boolean>(true);
  readonly stats = signal<AggregatedStats>({
    totalPatients: 0,
    totalTests: 0,
    averageScore: 0,
    patientsStable: 0,
    patientsAttention: 0,
    patientsCritical: 0,
  });

  ngOnInit() {
    this.loadAggregatedData();
  }

  private loadAggregatedData() {
    this.doctorDashboardService.getPatientsPage(1, 1000).subscribe({
      next: (result) => {
        const patients = result.patients;
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
        this.isLoading.set(false);
      }
    });
  }

  exportCSV() {
    this.doctorDashboardService.getPatientsPage(1, 1000).subscribe({
      next: (result) => {
        const patients = result.patients;
        const csvContent = this.generateCSV(patients);
        this.downloadFile(csvContent, 'analise-pacientes.csv', 'text/csv');
      }
    });
  }

  exportPDF() {
    // TODO: Implementar geração de PDF com gráficos
    alert('Funcionalidade de exportação PDF será implementada em breve');
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
