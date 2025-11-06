import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorService } from '../../services/doctor.service';
import { DoctorDashboardService } from '../../services/doctor-dashboard.service';
import { BindingRequest } from '../../../../core/models/binding-request.model';
import { Patient, PatientStatus } from '../../../../core/models/patient.model';
import { PatientProfileModalComponent, PatientProfile } from '../../../../shared/components/patient-profile-modal/patient-profile-modal.component';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';

interface PatientWithBinding extends Patient {
  bindingStatus?: 'none' | 'pending' | 'linked';
}

@Component({
  selector: 'app-binding-requests',
  standalone: true,
  imports: [CommonModule, PatientProfileModalComponent],
  templateUrl: './binding-requests.component.html',
})
export class BindingRequestsComponent implements OnInit {
  private medicService = inject(DoctorService);
  private dashboardService = inject(DoctorDashboardService);
  private notificationService = inject(NotificationService);

  // Solicitações
  requests = signal<BindingRequest[]>([]);  // Recebidas de pacientes
  sentRequests = signal<any[]>([]);  // Enviadas para pacientes
  activeTab = signal<'received' | 'sent'>('received');
  isLoading = signal<boolean>(true);

  // Modal de perfil
  isPatientProfileModalVisible = signal<boolean>(false);
  selectedPatient = signal<PatientProfile | null>(null);

  // Busca de pacientes
  searchTerm = signal<string>('');
  statusFilter = signal<string>('');
  searchResults = signal<PatientWithBinding[]>([]);
  isLoadingSearch = signal<boolean>(false);
  sortBy = signal<'name' | 'age' | 'lastTestDate'>('name');
  sortOrder = signal<'asc' | 'desc'>('asc');

  ngOnInit(): void {
    this.loadRequests();
    this.loadSentRequests();
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

  loadSentRequests(): void {
    this.medicService.getSentRequestsToPatients().subscribe({
      next: (data) => {
        if (data != null) this.sentRequests.set(data);
      },
      error: (err) => console.error('Erro ao carregar solicitações enviadas:', err),
    });
  }

  setActiveTab(tab: 'received' | 'sent'): void {
    this.activeTab.set(tab);
  }

  acceptRequest(id: number): void {
    this.medicService.acceptBindingRequest(id).subscribe({
      next: () => {
        this.notificationService.success('Solicitação aceita com sucesso', 3000);
        this.requests.update((reqs) => reqs.filter((r) => r.id !== id));
      },
      error: (err) => {
        this.notificationService.error(
          `Erro ao aceitar solicitação: ${err.error?.detail || 'Tente novamente'}`,
          5000
        );
      },
    });
  }

  rejectRequest(id: number): void {
    this.medicService.rejectBindingRequest(id).subscribe({
      next: () => {
        this.notificationService.success('Solicitação recusada', 3000);
        this.requests.update((reqs) => reqs.filter((r) => r.id !== id));
      },
      error: (err) => {
        this.notificationService.error(
          `Erro ao recusar solicitação: ${err.error?.detail || 'Tente novamente'}`,
          5000
        );
      },
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

    const searchPromise = firstValueFrom(
      this.medicService.searchPatients(this.searchTerm(), '')
    );

    try {
      const [, results] = await Promise.all([delayPromise, searchPromise]);

      if (results) {
        // Mapeia os resultados do backend para o formato esperado
        const patientsWithBinding: PatientWithBinding[] = results.map((patient: any) => ({
          id: patient.id,
          name: patient.name,
          email: patient.email,
          cpf: '',
          age: 0,
          status: 'stable' as PatientStatus,
          lastTestDate: '',
          lastTestType: undefined,
          testsCount: 0,
          location: patient.location,
          bindingStatus: 'none' as const,
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
    const numericId = typeof patientId === 'string' ? parseInt(patientId, 10) : patientId;

    this.medicService.requestBindingWithPatient(numericId).subscribe({
      next: () => {
        this.notificationService.success('Convite enviado com sucesso', 3000);
        // Atualiza o status do paciente na lista
        this.searchResults.update((patients) =>
          patients.map((p) =>
            p.id === patientId ? { ...p, bindingStatus: 'pending' as const } : p
          )
        );
      },
      error: (err) => {
        this.notificationService.error(
          `Erro ao enviar convite: ${err.error?.detail || 'Tente novamente'}`,
          5000
        );
      },
    });
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

  viewPatientProfile(request: BindingRequest): void {
    const patientProfile: PatientProfile = {
      id: request.patient.id.toString(),
      name: request.patient.name,
      age: 0, // Não disponível nas solicitações
      email: request.patient.email,
      status: 'pending',
    };
    this.selectedPatient.set(patientProfile);
    this.isPatientProfileModalVisible.set(true);
  }

  closePatientProfile(): void {
    this.isPatientProfileModalVisible.set(false);
    this.selectedPatient.set(null);
  }
}
