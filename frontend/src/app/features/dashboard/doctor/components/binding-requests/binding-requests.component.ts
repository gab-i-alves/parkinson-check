import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorService } from '../../../services/doctor.service';
import { DoctorDashboardService } from '../../../services/doctor-dashboard.service';
import { BindingService } from '../../../../../core/services/binding.service';
import { BindingRequestResponse, isBindingPatient, UserType } from '../../../../../core/models/binding-request.model';
import { Patient, PatientStatus } from '../../../../../core/models/patient.model';
import { DoctorProfileModalComponent, ProfileData } from '../../../../../shared/components/doctor-profile-modal/doctor-profile-modal.component';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../../../../shared/services/toast.service';
import { CpfPipe } from '../../../../../shared/pipes/cpf.pipe';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';

interface PatientWithBinding extends Patient {
  bindingStatus?: 'none' | 'pending' | 'linked';
  location?: string;
}

@Component({
  selector: 'app-binding-requests',
  standalone: true,
  imports: [CommonModule, DoctorProfileModalComponent, CpfPipe, BadgeComponent],
  templateUrl: './binding-requests.component.html',
})
export class BindingRequestsComponent implements OnInit {
  private medicService = inject(DoctorService);
  private bindingService = inject(BindingService);
  private dashboardService = inject(DoctorDashboardService);
  private toastService = inject(ToastService);

  // Solicitações
  requests = signal<BindingRequestResponse[]>([]);  // Recebidas de pacientes
  sentRequests = signal<BindingRequestResponse[]>([]);  // Enviadas para pacientes
  activeTab = signal<'received' | 'sent'>('received');
  isLoading = signal<boolean>(true);

  // Modal de perfil
  isPatientProfileModalVisible = signal<boolean>(false);
  selectedPatient = signal<ProfileData | null>(null);
  showModalMessageField = signal<boolean>(false);

  // Busca de pacientes
  searchTerm = signal<string>('');
  statusFilter = signal<string>('');
  testTypeFilter = signal<string>('');
  searchResults = signal<PatientWithBinding[]>([]);
  isLoadingSearch = signal<boolean>(false);
  sortBy = signal<'name' | 'age' | 'lastTestDate'>('name');
  sortOrder = signal<'asc' | 'desc'>('asc');

  // Paginação
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  pageSizeOptions = [10, 25, 50];
  Math = Math;

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading.set(true);
    this.bindingService.getPendingBindingRequests().subscribe({
      next: (data) => {
        // Filter requests created BY patients (received by doctor)
        const received = data.filter(req => req.created_by_type === UserType.PATIENT);
        this.requests.set(received);

        // Filter requests created BY doctor (sent to patients)
        const sent = data.filter(req => req.created_by_type === UserType.DOCTOR);
        this.sentRequests.set(sent);

        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  setActiveTab(tab: 'received' | 'sent'): void {
    this.activeTab.set(tab);
  }

  acceptRequest(id: number): void {
    this.bindingService.acceptBindingRequest(id).subscribe({
      next: () => {
        this.toastService.success('Solicitação aceita com sucesso!');
        this.loadRequests(); // Reload to refresh the list
      },
      error: (err) => {
        this.toastService.error(
          `Erro ao aceitar solicitação: ${err.error?.detail || 'Tente novamente'}`
        );
      },
    });
  }

  rejectRequest(id: number): void {
    this.bindingService.rejectBindingRequest(id).subscribe({
      next: () => {
        this.toastService.success('Solicitação recusada com sucesso!');
        this.loadRequests(); // Reload to refresh the list
      },
      error: (err) => {
        this.toastService.error(
          `Erro ao recusar solicitação: ${err.error?.detail || 'Tente novamente'}`
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
      this.medicService.searchPatients(this.searchTerm(), '', this.statusFilter())
    );

    try {
      const [, results] = await Promise.all([delayPromise, searchPromise]);

      if (results) {
        // Mapeia os resultados do backend para o formato esperado
        const patientsWithBinding: PatientWithBinding[] = results.map((patient: any) => ({
          id: patient.id,
          name: patient.name,
          email: patient.email,
          cpf: patient.cpf || '',
          age: patient.age || 0,
          status: patient.status as PatientStatus || 'stable',
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

  openInviteModal(patient: PatientWithBinding): void {
    const patientProfile: ProfileData = {
      id: patient.id,
      name: patient.name,
      email: patient.email || '',
      cpf: patient.cpf,
      age: patient.age,
    };
    this.selectedPatient.set(patientProfile);
    this.showModalMessageField.set(true);
    this.isPatientProfileModalVisible.set(true);
  }

  sendInviteWithMessage(event: { doctorId: number | string; message?: string }): void {
    const { doctorId: patientId, message } = event;
    const numericId = typeof patientId === 'string' ? parseInt(patientId, 10) : patientId;

    this.bindingService.requestBinding(numericId, message).subscribe({
      next: () => {
        this.toastService.success('Convite enviado com sucesso!');
        // Update patient status in the list
        this.searchResults.update((patients) =>
          patients.map((p) =>
            p.id === patientId ? { ...p, bindingStatus: 'pending' as const } : p
          )
        );
        this.loadRequests(); // Reload requests to show in "Enviadas" tab
        this.closePatientProfile();
      },
      error: (err) => {
        this.toastService.error(
          `Erro ao enviar convite: ${err.error?.detail || 'Tente novamente'}`
        );
        this.closePatientProfile();
      },
    });
  }

  // Keep for backward compatibility (direct button clicks without message)
  sendInvite(patientId: string): void {
    const numericId = typeof patientId === 'string' ? parseInt(patientId, 10) : patientId;

    this.bindingService.requestBinding(numericId).subscribe({
      next: () => {
        this.toastService.success('Convite enviado com sucesso!');
        // Update patient status in the list
        this.searchResults.update((patients) =>
          patients.map((p) =>
            p.id === patientId ? { ...p, bindingStatus: 'pending' as const } : p
          )
        );
      },
      error: (err) => {
        this.toastService.error(
          `Erro ao enviar convite: ${err.error?.detail || 'Tente novamente'}`
        );
      },
    });
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

  getFilterStatusLabel(): string {
    const filter = this.statusFilter();
    if (!filter) return '';
    const labels: Record<string, string> = {
      stable: 'Estável',
      attention: 'Atenção',
      critical: 'Crítico',
    };
    return labels[filter] || filter;
  }

  getTestTypeLabel(testType?: string): string {
    if (!testType) return 'N/A';
    const labels: Record<string, string> = {
      spiral: 'Espiral',
      voice: 'Voz',
    };
    return labels[testType] || testType;
  }

  formatDate(date?: string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
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

  viewPatientProfile(request: BindingRequestResponse): void {
    console.log('=== DEBUG viewPatientProfile ===');
    console.log('Request completo:', request);
    console.log('User:', request.user);
    console.log('Tem CPF?', 'cpf' in request.user);
    console.log('isBindingPatient?', isBindingPatient(request.user));

    if (isBindingPatient(request.user)) {
      console.log('Entrou no if - criando patientProfile');
      const patientProfile: ProfileData = {
        id: request.user.id.toString(),
        name: request.user.name,
        email: request.user.email,
        cpf: request.user.cpf,
        age: request.user.age,
        location: request.user.location || '',
      };
      console.log('Patient profile criado:', patientProfile);
      this.selectedPatient.set(patientProfile);
      this.showModalMessageField.set(false);
      this.isPatientProfileModalVisible.set(true);
      console.log('Sinais setados - modal deveria abrir');
    } else {
      console.log('NÃO entrou no if - tipo não é BindingPatient');
    }
  }

  viewPatientFromSearch(patient: PatientWithBinding): void {
    const patientProfile: ProfileData = {
      id: patient.id,
      name: patient.name,
      email: patient.email || '',
      cpf: patient.cpf,
      age: patient.age,
      location: patient.location,
    };
    this.selectedPatient.set(patientProfile);
    this.showModalMessageField.set(false);
    this.isPatientProfileModalVisible.set(true);
  }

  closePatientProfile(): void {
    this.isPatientProfileModalVisible.set(false);
    this.selectedPatient.set(null);
    this.showModalMessageField.set(false);
  }

  // Helper method to safely get email from user
  getEmail(user: any): string {
    return isBindingPatient(user) ? user.email : '';
  }

  // Paginação computed
  totalPages(): number {
    return Math.ceil(this.searchResults().length / this.pageSize());
  }

  paginatedResults(): PatientWithBinding[] {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.searchResults().slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  onPageSizeChange(event: Event): void {
    const value = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageSize.set(value);
    this.currentPage.set(1); // Reset to first page
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.testTypeFilter.set('');
    this.currentPage.set(1);
  }
}
