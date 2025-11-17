import { Component, OnInit, signal } from '@angular/core';
import {
  ChangeStatusData,
  UserManagementService,
} from '../../services/user-management.service';
import { Subject } from 'rxjs';
import {
  User,
  UserFilters,
  UserRole,
} from '../../../../core/models/user.model';
import { RouterLink } from '@angular/router';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  imports: [RouterLink, ConfirmationModalComponent, FormsModule],
  templateUrl: './user-management.component.html',
})
export class UserManagementComponent implements OnInit {
  users = signal<User[]>([]);
  isLoading = signal<boolean>(false);
  searchQuery = signal<string>('');
  selectedStatus = signal<number>(0);
  selectedUserType = signal<UserRole | ''>('');
  sortBy = signal<'id' | 'name' | 'type' | 'status'>('id');
  sortOrder = signal<'asc' | 'desc'>('asc');

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalPages = signal<number>(1);
  totalUsers = signal<number>(0);

  pageSizeOptions = [10, 25, 50, 100];

  readonly Math = Math;

  isStatusModalVisible = signal<boolean>(false);
  userToToggleStatus = signal<User | null>(null);
  deactivationReason: string = '';

  private searchSubject = new Subject<string>();

  constructor(private userManagementService: UserManagementService) {}

  public Number = Number;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);

    const filters: UserFilters = {
      searchQuery: this.searchQuery() || undefined,
      userType: this.selectedUserType() || undefined,
      status: this.selectedStatus() || undefined,
    };

    this.userManagementService
      .getUsersPage(this.currentPage(), this.pageSize(), filters)
      .subscribe({
        next: (result) => {
          const sortedUsers = this.sortUsers(result.users);
          this.users.set(sortedUsers);
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

  sortUsers(users: User[]): User[] {
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
        case 'type':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'status':
          comparison = Number(a.status) - Number(b.status);
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
      | 'type'
      | 'status';
    this.sortBy.set(value);
    const sortedUsers = this.sortUsers(this.users());
    this.users.set(sortedUsers);
  }

  toggleSortOrder(): void {
    this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    const sortedUsers = this.sortUsers(this.users());
    this.users.set(sortedUsers);
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
    const value = (event.target as HTMLSelectElement).value as
      | 'true'
      | 'false'
      | '';

    switch (value) {
      case 'true':
        this.selectedStatus.set(1);
        break;
      case 'false':
        this.selectedStatus.set(0);
        break;
      default:
        this.selectedStatus.set(2);
    }

    console.log(this.selectedStatus());
    this.currentPage.set(1);
    this.loadUsers();
  }

  onUserTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as UserRole | '';
    console.log(value);
    this.selectedUserType.set(value);
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
    this.selectedStatus.set(2);
    this.selectedUserType.set('');
    this.currentPage.set(1);
    this.loadUsers();
  }

  getStatusLabel(status: boolean): string {
    return status ? 'ativo' : 'inativo';
  }

  getStatusClass(status: boolean): string {
    return status ? ' text-green-800' : ' text-red-800';
  }

  getUserTypeLabel(userRole?: number): string {
    if (!userRole) return 'N/A';
    const labels: Record<number, string> = {
      1: 'Paciente',
      2: 'Médico',
      3: 'Administrador',
    };
    return labels[userRole];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  initiateStatusChange(user: User): void {
    this.userToToggleStatus.set(user);
    this.isStatusModalVisible.set(true);
  }

  cancelStatusChange(): void {
    this.userToToggleStatus.set(null);
    this.isStatusModalVisible.set(false);
    this.deactivationReason = '';
  }

  confirmStatusChange(reason?: string): void {
    const userToToggleStatus = this.userToToggleStatus();
    if (!userToToggleStatus) {
      return;
    }

    const is_active = !userToToggleStatus.status;

    const statusData: ChangeStatusData = {
      is_active,
      reason: reason || '',
    };

    this.userManagementService
      .changeUserStatus(userToToggleStatus.id, statusData)
      .subscribe({
        next: () => {
          this.loadUsers();

          alert('Status do Usuário alterado');

          this.isStatusModalVisible.set(false);
          this.userToToggleStatus.set(null);
          this.deactivationReason = '';
        },
        error: (err) => {
          alert('Ocorreu um erro ao alterar o status do usuário.');
          console.error(err);
          this.isStatusModalVisible.set(false);
          this.deactivationReason = '';
        },
      });
  }
}
