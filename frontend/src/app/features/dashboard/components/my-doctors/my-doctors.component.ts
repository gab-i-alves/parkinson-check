import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../services/doctor.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { Doctor } from '../../../../core/models/doctor.model';

@Component({
  selector: 'app-my-doctors',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmationModalComponent,
  ],
  templateUrl: './my-doctors.component.html',
})
export class MyDoctorsComponent {
  private medicService = inject(DoctorService);

  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);
  sortBy = signal<'name' | 'expertise_area' | 'location'>('name');
  sortOrder = signal<'asc' | 'desc'>('asc');

  isUnlinkModalVisible = signal<boolean>(false);
  doctorToUnlink = signal<Doctor | null>(null);

  linkedDoctors = signal<Doctor[]>([]);

  filteredDoctors = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const doctors = this.linkedDoctors();

    if (!query) {
      return this.sortDoctors(doctors);
    }

    const filtered = doctors.filter((doctor) =>
      doctor.name.toLowerCase().includes(query) ||
      doctor.expertise_area.toLowerCase().includes(query) ||
      doctor.location.toLowerCase().includes(query)
    );

    return this.sortDoctors(filtered);
  });

  ngOnInit(): void {
    this.loadLinkedDoctors();
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
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
  }

  toggleSortOrder(): void {
    this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
  }

  loadLinkedDoctors(): void {
    this.isLoading.set(true);
    this.medicService.loadLinkedDoctors().subscribe({
      next: (results) => {
        if (results != null) {
          const doctorsWithStatus = results.map((d) => ({
            ...d,
          }));
          const sortedDoctors = this.sortDoctors(doctorsWithStatus);
          this.linkedDoctors.set(sortedDoctors);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
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
        this.linkedDoctors.update((currentDoctors) =>
          currentDoctors.filter((doctor) => doctor.id !== doctorToUnlink.id)
        );

        alert('Médico desvinculado com sucesso.');

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
