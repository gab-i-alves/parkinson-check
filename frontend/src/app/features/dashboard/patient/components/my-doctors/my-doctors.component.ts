import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../services/doctor.service';
import { BindingService } from '../../../../core/services/binding.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { DoctorProfileModalComponent } from '../../../../shared/components/doctor-profile-modal/doctor-profile-modal.component';
import { Doctor } from '../../../../core/models/doctor.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-my-doctors',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmationModalComponent,
    DoctorProfileModalComponent,
  ],
  templateUrl: './my-doctors.component.html',
})
export class MyDoctorsComponent implements OnInit {
  private medicService = inject(DoctorService);
  private bindingService = inject(BindingService);
  private notificationService = inject(NotificationService);

  doctors = signal<Doctor[]>([]);
  isLoading = signal<boolean>(false);
  searchQuery = '';
  selectedSpecialty = signal<string>('');
  selectedLocation = signal<string>('');
  sortBy = signal<'name' | 'expertise_area' | 'location'>('name');
  sortOrder = signal<'asc' | 'desc'>('asc');

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalPages = signal<number>(1);
  totalDoctors = signal<number>(0);

  pageSizeOptions = [10, 25, 50];

  isUnlinkModalVisible = signal<boolean>(false);
  doctorToUnlink = signal<Doctor | null>(null);

  isDoctorProfileModalVisible = signal<boolean>(false);
  selectedDoctor = signal<Doctor | null>(null);

  allDoctors: Doctor[] = [];

  readonly Math = Math;

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading.set(true);
    this.medicService.loadLinkedDoctors().subscribe({
      next: (results) => {
        if (results) {
          this.allDoctors = results;
          this.applyFiltersAndPagination();
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  applyFiltersAndPagination(): void {
    let filteredDoctors = [...this.allDoctors];

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredDoctors = filteredDoctors.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.crm?.toLowerCase().includes(query) ||
          false
      );
    }

    // Apply specialty filter
    if (this.selectedSpecialty()) {
      filteredDoctors = filteredDoctors.filter(
        (d) => d.expertise_area === this.selectedSpecialty()
      );
    }

    // Apply location filter
    if (this.selectedLocation()) {
      filteredDoctors = filteredDoctors.filter(
        (d) => d.location === this.selectedLocation()
      );
    }

    // Sort
    const sortedDoctors = this.sortDoctors(filteredDoctors);

    // Pagination
    const total = sortedDoctors.length;
    this.totalDoctors.set(total);
    this.totalPages.set(Math.ceil(total / this.pageSize()));

    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    const paginatedDoctors = sortedDoctors.slice(startIndex, endIndex);

    this.doctors.set(paginatedDoctors);
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.applyFiltersAndPagination();
  }

  onSpecialtyChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedSpecialty.set(value);
    this.currentPage.set(1);
    this.applyFiltersAndPagination();
  }

  onLocationChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedLocation.set(value);
    this.currentPage.set(1);
    this.applyFiltersAndPagination();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedSpecialty.set('');
    this.selectedLocation.set('');
    this.currentPage.set(1);
    this.applyFiltersAndPagination();
  }

  get availableSpecialties(): string[] {
    const specialties = new Set(this.allDoctors.map((d) => d.expertise_area));
    return Array.from(specialties).sort();
  }

  get availableLocations(): string[] {
    const locations = new Set(this.allDoctors.map((d) => d.location));
    return Array.from(locations).sort();
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
    this.applyFiltersAndPagination();
  }

  toggleSortOrder(): void {
    this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    this.applyFiltersAndPagination();
  }

  onPageSizeChange(event: Event): void {
    const value = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageSize.set(value);
    this.currentPage.set(1);
    this.applyFiltersAndPagination();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.applyFiltersAndPagination();
    }
  }

  get paginationInfo(): string {
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), this.totalDoctors());
    return `${start}-${end} de ${this.totalDoctors()}`;
  }

  viewProfile(doctor: Doctor): void {
    this.selectedDoctor.set(doctor);
    this.isDoctorProfileModalVisible.set(true);
  }

  closeDoctorProfile(): void {
    this.isDoctorProfileModalVisible.set(false);
    this.selectedDoctor.set(null);
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

    this.bindingService.unlinkBinding(doctorToUnlink.bindingId).subscribe({
      next: () => {
        // Remove from allDoctors array
        this.allDoctors = this.allDoctors.filter((doctor) => doctor.id !== doctorToUnlink.id);

        // Reapply filters and pagination
        this.applyFiltersAndPagination();

        this.notificationService.success('Médico desvinculado com sucesso', 3000);

        this.isUnlinkModalVisible.set(false);
        this.doctorToUnlink.set(null);
      },
      error: (err: any) => {
        this.notificationService.error('Ocorreu um erro ao desvincular o médico', 5000);
        console.error(err);
        this.isUnlinkModalVisible.set(false);
      },
    });
  }
}
