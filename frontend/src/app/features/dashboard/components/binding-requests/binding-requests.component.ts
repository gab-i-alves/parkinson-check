import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorService } from '../../services/doctor.service';
import { DoctorDashboardService } from '../../services/doctor-dashboard.service';
import { BindingRequest } from '../../../../core/models/binding-request.model';
import { Patient, PatientStatus } from '../../../../core/models/patient.model';
import { firstValueFrom } from 'rxjs';

interface PatientWithBinding extends Patient {
  bindingStatus?: 'none' | 'pending' | 'linked';
}

@Component({
  selector: 'app-binding-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './binding-requests.component.html',
})
export class BindingRequestsComponent implements OnInit {
  private medicService = inject(DoctorService);
  private dashboardService = inject(DoctorDashboardService);

  // Solicitações pendentes
  requests = signal<BindingRequest[]>([]);
  isLoading = signal<boolean>(true);

  // Busca de pacientes
  searchTerm = signal<string>('');
  statusFilter = signal<string>('');
  searchResults = signal<PatientWithBinding[]>([]);
  isLoadingSearch = signal<boolean>(false);
  sortBy = signal<'name' | 'age' | 'lastTestDate'>('name');
  sortOrder = signal<'asc' | 'desc'>('asc');

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading.set(true);
    this.medicService.getBindingRequests().subscribe({
      next: (data) => {
        if (data != null) this.requests.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  acceptRequest(id: number): void {
    this.medicService.acceptBindingRequest(id).subscribe({
      next: () => {
        alert('Solicitação aceita!');
        this.requests.update((reqs) => reqs.filter((r) => r.id !== id));
      },
      error: (err) => alert(`Erro ao aceitar: ${err.error.detail}`),
    });
  }

  rejectRequest(id: number): void {
    this.medicService.rejectBindingRequest(id).subscribe({
      next: () => {
        alert('Solicitação recusada.');
        this.requests.update((reqs) => reqs.filter((r) => r.id !== id));
      },
      error: (err) => alert(`Erro ao recusar: ${err.error.detail}`),
    });
  }

  onSearchTermChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  async searchPatients(): Promise<void> {
    this.isLoadingSearch.set(true);
    this.searchResults.set([]);

    const delayPromise = new Promise((resolve) => setTimeout(resolve, 500));

    const filters = {
      status: this.statusFilter() as PatientStatus | undefined,
    };

    const searchPromise = firstValueFrom(
      this.dashboardService.searchPatients(this.searchTerm(), filters)
    );

    try {
      const [, results] = await Promise.all([delayPromise, searchPromise]);

      if (results) {
        // Adiciona status de vínculo aos pacientes
        // TODO: Implementar lógica real quando backend estiver pronto
        const patientsWithBinding: PatientWithBinding[] = results.map((patient) => ({
          ...patient,
          bindingStatus: 'none' as const, // Por enquanto todos como 'none'
        }));

        const sortedPatients = this.sortPatients(patientsWithBinding);
        this.searchResults.set(sortedPatients);
      }
    } catch (err) {
      console.error('Erro na busca:', err);
      this.searchResults.set([]);
    } finally {
      this.isLoadingSearch.set(false);
    }
  }

  sortPatients(patients: PatientWithBinding[]): PatientWithBinding[] {
    const sorted = [...patients];
    const order = this.sortOrder() === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy()) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'age':
          comparison = a.age - b.age;
          break;
        case 'lastTestDate':
          comparison = new Date(a.lastTestDate).getTime() - new Date(b.lastTestDate).getTime();
          break;
      }

      return comparison * order;
    });

    return sorted;
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'name' | 'age' | 'lastTestDate';
    this.sortBy.set(value);

    const sortedPatients = this.sortPatients(this.searchResults());
    this.searchResults.set(sortedPatients);
  }

  toggleSortOrder(): void {
    this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');

    const sortedPatients = this.sortPatients(this.searchResults());
    this.searchResults.set(sortedPatients);
  }

  sendInvite(patientId: string): void {
    // TODO: Implementar quando backend estiver pronto
    alert(`Convite enviado para o paciente ${patientId}!`);

    // Atualiza o status do paciente na lista
    this.searchResults.update((patients) =>
      patients.map((p) =>
        p.id === patientId ? { ...p, bindingStatus: 'pending' as const } : p
      )
    );
  }

  getStatusLabel(status: PatientStatus): string {
    const labels: Record<PatientStatus, string> = {
      stable: 'Estável',
      attention: 'Atenção',
      critical: 'Crítico',
    };
    return labels[status];
  }

  getStatusClass(status: PatientStatus): string {
    const classes: Record<PatientStatus, string> = {
      stable: 'bg-green-100 text-green-800',
      attention: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
    };
    return classes[status];
  }
}
