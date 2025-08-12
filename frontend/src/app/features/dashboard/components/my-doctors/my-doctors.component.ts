import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Doctor, DoctorService } from '../../services/doctor.service';
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
  searchResults = signal<Doctor[]>([]);
  isLoading = signal<boolean>(false);

  isModalVisible = signal<boolean>(false);
  selectedDoctor = signal<Doctor | null>(null);

  linkedDoctors = signal<Doctor[]>([
    {
      id: 1,
      name: 'Dr. Carlos Santos',
      specialty: 'Neurologia',
      crm: 'CRM-PR 12345',
      location: 'Curitiba, PR',
      status: 'linked',
    },
  ]);

  sentRequests = signal<Doctor[]>([]);

  selectTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
  }

  searchDoctors(): void {
    if (this.searchTerm().trim() === '') {
      this.searchResults.set([]);
      return;
    }
    this.isLoading.set(true);
    this.medicService.searchDoctors(this.searchTerm()).subscribe({
      next: (results) => {
        const doctorsWithStatus = results.map((d) => ({
          ...d,
          status: 'unlinked' as const,
        }));
        this.searchResults.set(doctorsWithStatus);
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
        this.sentRequests.update((reqs) => [
          ...reqs,
          { ...doctorInSearch, status: 'pending' },
        ]);
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
