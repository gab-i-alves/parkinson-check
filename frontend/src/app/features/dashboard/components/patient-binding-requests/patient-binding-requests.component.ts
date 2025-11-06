import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../services/doctor.service';
import { DoctorProfileModalComponent } from '../../../../shared/components/doctor-profile-modal/doctor-profile-modal.component';
import { Doctor } from '../../../../core/models/doctor.model';
import { PatientBindingRequest } from '../../../../core/models/patient-binding-request.model';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-patient-binding-requests',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DoctorProfileModalComponent,
  ],
  templateUrl: './patient-binding-requests.component.html',
})
export class PatientBindingRequestsComponent {
  private medicService = inject(DoctorService);
  private notificationService = inject(NotificationService);

  searchTerm = signal<string>('');
  specialty = signal<string>('');
  searchResults = signal<Doctor[]>([]);
  isLoading = signal<boolean>(false);
  sortBy = signal<'name' | 'expertise_area' | 'location'>('name');
  sortOrder = signal<'asc' | 'desc'>('asc');

  isModalVisible = signal<boolean>(false);
  selectedDoctor = signal<Doctor | null>(null);

  linkedDoctors = signal<Doctor[]>([]);
  sentRequests = signal<PatientBindingRequest[]>([]);
  receivedRequests = signal<any[]>([]);
  activeTab = signal<'sent' | 'received'>('sent');

  ngOnInit(): void {
    this.loadLinkedDoctors();
    this.loadSentRequests();
    this.loadReceivedRequests();
  }

  async searchDoctors(): Promise<void> {
    this.isLoading.set(true);
    this.searchResults.set([]);

    const delayPromise = new Promise((resolve) => setTimeout(resolve, 500));

    const searchPromise = firstValueFrom(
      this.medicService.searchDoctors(this.searchTerm(), this.specialty())
    );

    try {
      const [, results] = await Promise.all([delayPromise, searchPromise]);

      if (results) {
        const linkedIds = new Set(this.linkedDoctors().map((d) => d.id));
        const pendingIds = new Set(this.sentRequests().map((r) => r.doctor.id));
        const doctorsWithStatus = results.map((doctor) => {
          let status: 'linked' | 'pending' | 'unlinked' = 'unlinked';
          if (linkedIds.has(doctor.id)) {
            status = 'linked';
          } else if (pendingIds.has(doctor.id)) {
            status = 'pending';
          }
          return { ...doctor, status };
        });
        const sortedDoctors = this.sortDoctors(doctorsWithStatus);
        this.searchResults.set(sortedDoctors);
      }
    } catch (err) {
      console.error('Erro na busca:', err);
      this.searchResults.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  onSearchTermChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  sortDoctors(doctors: Doctor[]): Doctor[] {
    const sorted = [...doctors];
    const order = this.sortOrder() === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy()) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'expertise_area':
          comparison = a.expertise_area.localeCompare(b.expertise_area);
          break;
        case 'location':
          comparison = a.location.localeCompare(b.location);
          break;
      }

      return comparison * order;
    });

    return sorted;
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'name' | 'expertise_area' | 'location';
    this.sortBy.set(value);

    const sortedDoctors = this.sortDoctors(this.searchResults());
    this.searchResults.set(sortedDoctors);
  }

  toggleSortOrder(): void {
    this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');

    const sortedDoctors = this.sortDoctors(this.searchResults());
    this.searchResults.set(sortedDoctors);
  }

  loadLinkedDoctors(): void {
    this.isLoading.set(true);
    this.medicService.loadLinkedDoctors().subscribe({
      next: (results) => {
        if (results != null) {
          const doctorsWithStatus = results.map((d) => ({
            ...d,
          }));
          this.linkedDoctors.set(doctorsWithStatus);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  loadSentRequests(): void {
    this.isLoading.set(true);
    this.medicService.loadSentRequests().subscribe({
      next: (results) => {
        if (results != null) {
          const requestsWithDoctors = results.map((d) => ({
            ...d,
          }));
          this.sentRequests.set(requestsWithDoctors);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  loadReceivedRequests(): void {
    this.isLoading.set(true);
    this.medicService.getReceivedRequestsFromDoctors().subscribe({
      next: (results) => {
        if (results != null) {
          this.receivedRequests.set(results);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  setActiveTab(tab: 'sent' | 'received'): void {
    this.activeTab.set(tab);
  }

  acceptRequest(requestId: number): void {
    this.medicService.acceptDoctorRequest(requestId).subscribe({
      next: () => {
        this.notificationService.success('Solicitação aceita com sucesso', 3000);
        this.loadReceivedRequests();
        this.loadLinkedDoctors();
      },
      error: (err) => {
        this.notificationService.error(
          `Erro ao aceitar solicitação: ${err.error?.detail || 'Tente novamente'}`,
          5000
        );
      },
    });
  }

  rejectRequest(requestId: number): void {
    this.medicService.rejectDoctorRequest(requestId).subscribe({
      next: () => {
        this.notificationService.success('Solicitação recusada', 3000);
        this.loadReceivedRequests();
      },
      error: (err) => {
        this.notificationService.error(
          `Erro ao recusar solicitação: ${err.error?.detail || 'Tente novamente'}`,
          5000
        );
      },
    });
  }

  viewProfile(doctor: Doctor): void {
    this.selectedDoctor.set(doctor);
    this.isModalVisible.set(true);
  }

  closeModal(): void {
    this.isModalVisible.set(false);
    this.selectedDoctor.set(null);
  }

  requestLink(doctorId: number): void {
    const doctorInSearch = this.searchResults().find((d) => d.id === doctorId);
    if (!doctorInSearch || doctorInSearch.status === 'pending') return;

    this.medicService.requestBinding(doctorId).subscribe({
      next: () => {
        this.notificationService.success('Solicitação enviada com sucesso', 3000);
        this.searchResults.update((doctors) =>
          doctors.map((d) =>
            d.id === doctorId ? { ...d, status: 'pending' } : d
          )
        );
        this.loadSentRequests();
        this.closeModal();
      },
      error: (err) => {
        this.notificationService.error(
          `Erro ao enviar solicitação: ${err.error?.detail || 'Tente novamente'}`,
          5000
        );
        this.closeModal();
      },
    });
  }
}
