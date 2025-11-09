import { Component, OnInit, signal } from '@angular/core';
import { UserManagementService } from '../../services/user-management.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  User,
  UserFilters,
  UserRole,
} from '../../../../core/models/user.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-management',
  imports: [RouterLink],
  templateUrl: './user-management.component.html',
})
export class UserManagementComponent implements OnInit {
  users = signal<User[]>([]);
  isLoading = signal<boolean>(false);
  searchQuery = signal<string>('');
  selectedStatus = signal<boolean>(true);
  selectedUserType = signal<UserRole | ''>('');
  sortBy = signal<'id' | 'name' | 'type' | 'status'>('id');
  sortOrder = signal<'asc' | 'desc'>('asc');

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalPages = signal<number>(1);
  totalUsers = signal<number>(0);

  pageSizeOptions = [10, 25, 50];

  readonly Math = Math;

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
      status: this.selectedStatus() ,
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
    const value = (event.target as HTMLSelectElement).value as 'true' | 'false';
    this.selectedStatus.set(value !== 'false');
    console.log(this.selectedStatus())
    this.currentPage.set(1);
    this.loadUsers();
  }

  onUserTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as UserRole | '';
    console.log(value)
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
    this.selectedStatus.set(true);
    this.selectedUserType.set('');
    this.currentPage.set(1);
    this.loadUsers();
  }

  getStatusLabel(status: boolean): string {
    return status ? 'ativo' : 'inativo';
  }

  getStatusClass(status: boolean): string {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
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


  onToggleStatus(user: any): void {
    // UserListItem
    // Abrir modal de confirmação
    // No modal:
    // const newStatus = !user.is_active;
    // const reason = newStatus ? undefined : prompt('Motivo da desativação:');
    // if (!newStatus && !reason) return; // Cancelou
    // this.userMgmtService.changeUserStatus(user.id, { is_active: newStatus, reason: reason })
    //   .subscribe(() => this.loadUsers());
  }

  onEdit(userId: number): void {
    // Navegar para rota de edição ou abrir modal
    // this.router.navigate(['/dashboard/admin/users', userId, 'edit']);
  }
}
