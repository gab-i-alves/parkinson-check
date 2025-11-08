import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../services/doctor.service';
import { BindingService } from '../../../../core/services/binding.service';
import { DoctorProfileModalComponent } from '../../../../shared/components/doctor-profile-modal/doctor-profile-modal.component';
import { Doctor } from '../../../../core/models/doctor.model';
import { BindingRequestResponse, isBindingDoctor } from '../../../../core/models/binding-request.model';
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
  private bindingService = inject(BindingService);
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
  sentRequests = signal<BindingRequestResponse[]>([]);
  receivedRequests = signal<BindingRequestResponse[]>([]);
  activeTab = signal<'sent' | 'received'>('sent');

  ngOnInit(): void {
    this.loadLinkedDoctors();
    this.loadRequests();
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
        const pendingIds = new Set(
          this.sentRequests()
            .filter(r => isBindingDoctor(r.user))
            .map((r) => r.user.id)
        );
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

  loadRequests(): void {
    this.isLoading.set(true);
    this.bindingService.getPendingBindingRequests().subscribe({
      next: (data) => {
        // Filter requests by doctor (as patient, we interact with doctors)
        const doctorRequests = data.filter(req => isBindingDoctor(req.user));

        // Separate sent and received requests
        // Note: The unified endpoint returns pending requests
        // We'll need to check the status or implement additional logic
        // For now, we'll treat all as received (doctors sending to patient)
        this.receivedRequests.set(doctorRequests);
        this.sentRequests.set([]); // Will be populated if we track sent separately

        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  setActiveTab(tab: 'sent' | 'received'): void {
    this.activeTab.set(tab);
  }

  acceptRequest(requestId: number): void {
    this.bindingService.acceptBindingRequest(requestId).subscribe({
      next: () => {
        this.notificationService.success('Solicitação aceita com sucesso', 3000);
        this.loadRequests();
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
    this.bindingService.rejectBindingRequest(requestId).subscribe({
      next: () => {
        this.notificationService.success('Solicitação recusada', 3000);
        this.loadRequests();
      },
      error: (err) => {
        this.notificationService.error(
          `Erro ao recusar solicitação: ${err.error?.detail || 'Tente novamente'}`,
          5000
        );
      },
    });
  }

  viewProfile(user: any): void {
    // Only open profile if it's a doctor
    if (isBindingDoctor(user)) {
      const doctor: Doctor = {
        id: user.id,
        name: user.name,
        expertise_area: user.specialty,
        crm: '',
        location: '',
        status: 'unlinked'
      };
      this.selectedDoctor.set(doctor);
      this.isModalVisible.set(true);
    }
  }

  closeModal(): void {
    this.isModalVisible.set(false);
    this.selectedDoctor.set(null);
  }

  requestLink(doctorId: number): void {
    const doctorInSearch = this.searchResults().find((d) => d.id === doctorId);
    if (!doctorInSearch || doctorInSearch.status === 'pending') return;

    this.bindingService.requestBinding(doctorId).subscribe({
      next: () => {
        this.notificationService.success('Solicitação enviada com sucesso', 3000);
        this.searchResults.update((doctors) =>
          doctors.map((d) =>
            d.id === doctorId ? { ...d, status: 'pending' } : d
          )
        );
        this.loadRequests();
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

  // Helper method to safely get specialty from user
  getSpecialty(user: any): string {
    return isBindingDoctor(user) ? user.specialty : '';
  }
}
