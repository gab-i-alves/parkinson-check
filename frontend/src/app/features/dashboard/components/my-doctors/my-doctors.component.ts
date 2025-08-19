import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BindingRequest, Doctor, DoctorService, PatientBindingRequest } from '../../services/doctor.service';
import { DoctorProfileModalComponent } from '../../../../shared/components/doctor-profile-modal/doctor-profile-modal.component';

type ActiveTab = 'linked' | 'requests' | 'find';

@Component({
  selector: 'app-my-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorProfileModalComponent],
  templateUrl: './my-doctors.component.html',
})
export class MyDoctorsComponent {
  private medicService = inject(DoctorService);

  activeTab = signal<ActiveTab>('linked');
  searchTerm = signal<string>('');
  specialty = signal<string>('');
  searchResults = signal<Doctor[]>([]);
  isLoading = signal<boolean>(false);
  hasActiveBinding = signal<boolean>(false);

  isModalVisible = signal<boolean>(false);
  selectedDoctor = signal<Doctor | null>(null);

  linkedDoctors = signal<Doctor[]>([]);
  sentRequests = signal<PatientBindingRequest[]>([]);

    ngOnInit(): void {
    this.loadLinkedDoctors();
    this.loadSentRequests();
  }


  selectTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
  }

  searchDoctors(): void {
    this.isLoading.set(true);
    this.medicService.searchDoctors(this.searchTerm(), this.specialty()).subscribe({
      next: (results) => {
        if (results != null) {const doctorsWithStatus = results.map((d) => ({
          ...d,
        }));
        this.searchResults.set(doctorsWithStatus);}
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  loadLinkedDoctors(): void {
    this.isLoading.set(true);
    this.medicService.loadLinkedDoctors().subscribe({
      next: (results) => {
        if (results != null) {const doctorsWithStatus = results.map((d) => ({
          ...d,
          // status: 'unlinked' as const,
        }));
        this.linkedDoctors.set(doctorsWithStatus);}
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  loadSentRequests(): void {
    this.isLoading.set(true);
    this.medicService.loadSentRequests().subscribe({
      next: (results) => {
        if (results != null) {const requestsWithDoctors = results.map((d) => ({
          ...d,
          // status: 'unlinked' as const,
        }));
        console.log(requestsWithDoctors)
        this.sentRequests.set(requestsWithDoctors);}
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
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
        alert('Solicitação enviada com sucesso!');
        this.searchResults.update((doctors) =>
          doctors.map((d) =>
            d.id === doctorId ? { ...d, status: 'pending' } : d
          )
        );
        this.loadSentRequests();
        this.closeModal();
      },
      error: (err) => {
        alert(
          `Erro ao enviar solicitação: ${
            err.error.detail || 'Tente novamente.'
          }`
        );
        this.closeModal();
      },
    });
  }

  removeLink(doctor: Doctor): void {
    alert(`Lógica para desvincular do ${doctor.name} ainda não implementada.`);
  }
}
