import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User, UserRole, UserFilters, Doctor, DoctorStatus, DoctorFilters } from '@core/models';
import {
  ChangeStatusData,
  DoctorManagementService,
} from '@features/dashboard/services/doctor-management.service';
import { Subject } from 'rxjs';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { TooltipDirective } from '../../../../../shared/directives/tooltip.directive';
import { formatDate } from '../../../shared/utils/display-helpers';
import { ToastService } from '../../../../../shared/services/toast.service';

@Component({
  selector: 'app-doctor-management',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    BadgeComponent,
    TooltipDirective
  ],
  templateUrl: './doctor-management.component.html',
})
export class DoctorManagementComponent implements OnInit {
  doctors = signal<Doctor[]>([]);
  isLoading = signal<boolean>(false);
  searchQuery = signal<string>('');
  selectedStatus = signal<DoctorStatus | ''>('');
  selectedArea = signal<string>('');
  sortBy = signal<'id' | 'name' | 'approval_status' | 'expertise_area'>('id');
  sortOrder = signal<'asc' | 'desc'>('asc');

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalPages = signal<number>(1);
  totalUsers = signal<number>(0);

  pageSizeOptions = [10, 25, 50];

  readonly Math = Math;

  isStatusModalVisible = signal<boolean>(false);
  userToToggleStatus = signal<Doctor | null>(null);

  private searchSubject = new Subject<string>();

  constructor(
    private doctorManagementService: DoctorManagementService,
    private toastService: ToastService
  ) {}

  public Number = Number;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);

    const filters: DoctorFilters = {
      searchQuery: this.searchQuery() || undefined,
      area: this.selectedArea() || undefined,
      approval_status: this.selectedStatus() || undefined,
    };

    this.doctorManagementService
      .getDoctorsPage(this.currentPage(), this.pageSize(), filters)
      .subscribe({
        next: (result) => {
          const sortedUsers = this.sortDoctors(result.doctors);
          this.doctors.set(sortedUsers);
          this.totalPages.set(result.totalPages);
          this.totalUsers.set(result.total);

          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Erro ao carregar usuários:', err);
          this.isLoading.set(false);
        },
      });
  }

  sortDoctors(users: Doctor[]): Doctor[] {
    const sorted = [...users];
    const order = this.sortOrder() === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy()) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'approval_status':
          comparison = a.approval_status!.localeCompare(b.approval_status!);
          break;
        case 'expertise_area':
          comparison = a.expertise_area.localeCompare(b.expertise_area);
          break;
      }

      return comparison * order;
    });

    return sorted;
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as
      | 'id'
      | 'name'
      | 'approval_status'
      | 'expertise_area';
    this.sortBy.set(value);
    const sortedUsers = this.sortDoctors(this.doctors());
    this.doctors.set(sortedUsers);
  }

  toggleSortOrder(): void {
    this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    const sortedUsers = this.sortDoctors(this.doctors());
    this.doctors.set(sortedUsers);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as DoctorStatus

    this.selectedStatus.set(value)

    console.log(this.selectedStatus());
    this.currentPage.set(1);
    this.loadUsers();
  }

  onAreaChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    console.log(value);
    this.selectedArea.set(value);
    this.currentPage.set(1);
    this.loadUsers();
  }

  onPageSizeChange(event: Event): void {
    const value = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageSize.set(value);
    this.currentPage.set(1);
    this.loadUsers();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('');
    this.selectedArea.set('');
    this.currentPage.set(1);
    this.loadUsers();
  }

  formatDateDisplay(dateString: string | null | undefined): string {
    return formatDate(dateString || null);
  }

  getStatusBadgeVariant(status: string): any {
    const variants: Record<string, any> = {
      'PENDING': 'warning',
      'pendente': 'warning',
      'APPROVED': 'success',
      'aprovado(a)': 'success',
      'REJECTED': 'error',
      'rejeitado(a)': 'error',
      'SUSPENDED': 'error',
      'suspenso(a)': 'error',
      'IN_REVIEW': 'info',
      'em_revisao': 'info'
    };
    return variants[status] || 'neutral';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'Pendente',
      'pendente': 'Pendente',
      'APPROVED': 'Aprovado',
      'aprovado(a)': 'Aprovado',
      'REJECTED': 'Rejeitado',
      'rejeitado(a)': 'Rejeitado',
      'SUSPENDED': 'Suspenso',
      'suspenso(a)': 'Suspenso',
      'IN_REVIEW': 'Em Revisão',
      'em_revisao': 'Em Revisão'
    };
    return labels[status] || status;
  }

  initiateStatusChange(doctor: Doctor): void {
    this.userToToggleStatus.set(doctor);
    this.isStatusModalVisible.set(true);
  }

  cancelStatusChange(): void {
    this.userToToggleStatus.set(null);
    this.isStatusModalVisible.set(false);
  }

//   confirmStatusChange(): void {
//     const userToToggleStatus = this.userToToggleStatus();
//     if (!userToToggleStatus) {
//       return;
//     }

//     const is_active = !userToToggleStatus.status;
//     const reason = ''; // implementar motivo de desativação

//     const statusData: ChangeStatusData = {
//       is_active,
//       reason,
//     };

//     this.userManagementService
//       .changeUserStatus(userToToggleStatus.id, statusData)
//       .subscribe({
//         next: () => {
//           this.loadUsers();

//           alert('Status do Usuário alterado');

//           this.isStatusModalVisible.set(false);
//           this.userToToggleStatus.set(null);
//         },
//         error: (err) => {
//           alert('Ocorreu um erro ao alterar o status do usuário.');
//           console.error(err);
//           this.isStatusModalVisible.set(false);
//         },
//       });
//   }
}
