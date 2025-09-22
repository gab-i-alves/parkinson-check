import { Component, inject, signal, effect, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../services/doctor.service';
import { DoctorProfileModalComponent } from '../../../../shared/components/doctor-profile-modal/doctor-profile-modal.component';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { Doctor } from '../../../../core/models/doctor.model';
import { PatientBindingRequest } from '../../../../core/models/patient-binding-request.model';
import { firstValueFrom } from 'rxjs';

type ActiveTab = 'linked' | 'requests' | 'find';

@Component({
  selector: 'app-my-doctors',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DoctorProfileModalComponent,
    ConfirmationModalComponent,
  ],
  templateUrl: './my-doctors.component.html',
})
export class MyDoctorsComponent {
  private medicService = inject(DoctorService);
  private injector = inject(Injector);

  activeTab = signal<ActiveTab>('linked');
  searchTerm = signal<string>('');
  specialty = signal<string>('');
  searchResults = signal<Doctor[]>([]);
  isLoading = signal<boolean>(false);
  hasActiveBinding = signal<boolean>(false);

  isModalVisible = signal<boolean>(false);
  selectedDoctor = signal<Doctor | null>(null);

  isUnlinkModalVisible = signal<boolean>(false);
  doctorToUnlink = signal<Doctor | null>(null);

  linkedDoctors = signal<Doctor[]>([]);
  sentRequests = signal<PatientBindingRequest[]>([]);

  ngOnInit(): void {
    this.loadLinkedDoctors();
    this.loadSentRequests();
  }

  selectTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
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
        this.searchResults.set(doctorsWithStatus);
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

  loadLinkedDoctors(): void {
    this.isLoading.set(true);
    this.medicService.loadLinkedDoctors().subscribe({
      next: (results) => {
        if (results != null) {
          const doctorsWithStatus = results.map((d) => ({
            ...d,
            // status: 'unlinked' as const,
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
            // status: 'unlinked' as const,
          }));
          console.log(requestsWithDoctors);
          this.sentRequests.set(requestsWithDoctors);
        }
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

  initiateUnlink(doctor: Doctor): void {
    this.doctorToUnlink.set(doctor);
    this.isUnlinkModalVisible.set(true);
  }

  cancelUnlink(): void {
    this.doctorToUnlink.set(null);
    this.isUnlinkModalVisible.set(false);
  }

  confirmUnlink(): void {
    const doctorToUnlink = this.doctorToUnlink();
    if (!doctorToUnlink || !doctorToUnlink.bindingId) {
      return;
    }

    this.medicService.unlinkDoctor(doctorToUnlink.bindingId).subscribe({
      next: () => {
        // ATUALIZAÇÃO DIRETA DO ESTADO - A MELHOR ABORDAGEM
        this.linkedDoctors.update((currentDoctors) =>
          // Cria um NOVO array, filtrando o médico que foi removido.
          currentDoctors.filter((doctor) => doctor.id !== doctorToUnlink.id)
        );

        // (Opcional) Mostre uma notificação "toast" aqui em vez de um alert.
        alert('Médico desvinculado com sucesso.');

        // Limpa os sinais de controlo do modal
        this.isUnlinkModalVisible.set(false);
        this.doctorToUnlink.set(null);
      },
      error: (err) => {
        alert('Ocorreu um erro ao desvincular o médico.');
        console.error(err);
        this.isUnlinkModalVisible.set(false);
      },
    });
  }
}
