import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
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
import { DoctorDocument } from '../../../../../shared/components/document-viewer-modal/document-viewer-modal.component';
import { HttpErrorResponse } from '@angular/common/http';

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
  doctorToChangeStatus = signal<Doctor | null>(null);
  doctorDocuments = signal<DoctorDocument[]>([]);
  modalSelectedStatus: string = '';
  modalStatusChangeReason: string = '';

  private searchSubject = new Subject<string>();

  // Detectar se está na rota de aprovação
  isApprovalRoute = signal<boolean>(false);

  constructor(
    private doctorManagementService: DoctorManagementService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public Number = Number;

  ngOnInit(): void {
    // Verificar se está na rota de aprovação
    this.isApprovalRoute.set(this.router.url.includes('/approve'));

    // Verificar query params para filtro e abertura automática de modal
    this.route.queryParams.subscribe(params => {
      // Aplicar filtro de status se fornecido
      if (params['status']) {
        this.selectedStatus.set(params['status']);
      } else if (this.isApprovalRoute()) {
        // Se estiver na rota de aprovação, filtrar apenas pendentes
        this.selectedStatus.set('pendente');
      }

      // Carregar dados primeiro
      this.loadUsers();

      // Abrir modal automaticamente se fornecido doctorId
      if (params['autoOpenModal']) {
        const doctorId = Number(params['autoOpenModal']);
        // Aguardar o carregamento dos dados antes de abrir o modal
        setTimeout(() => {
          const doctor = this.doctors().find(d => d.id === doctorId);
          if (doctor) {
            this.initiateStatusChange(doctor);
          }
        }, 500);
      }
    });
  }

  loadUsers(): void {
    this.isLoading.set(true);

    // Se estiver na rota de aprovação, usar endpoint de pendentes
    if (this.isApprovalRoute()) {
      this.loadPendingDoctors();
      return;
    }

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

  loadPendingDoctors(): void {
    this.doctorManagementService.getPendingDoctors().subscribe({
      next: (doctors) => {
        if (doctors) {
          const sortedDoctors = this.sortDoctors(doctors);
          this.doctors.set(sortedDoctors);
          this.totalUsers.set(doctors.length);
          this.totalPages.set(Math.ceil(doctors.length / this.pageSize()));
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar médicos pendentes:', err);
        this.toastService.error('Erro ao carregar médicos pendentes');
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
    this.doctorToChangeStatus.set(doctor);
    this.modalSelectedStatus = this.mapApprovalStatusToBackend(doctor.approval_status || 'pending');
    this.modalStatusChangeReason = '';

    // Carregar documentos do médico
    this.doctorManagementService.getDoctorDocuments(doctor.id).subscribe({
      next: (docs: DoctorDocument[]) => {
        this.doctorDocuments.set(docs);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar documentos:', err);
        this.doctorDocuments.set([]);
      }
    });

    this.isStatusModalVisible.set(true);
  }

  closeStatusModal(): void {
    this.doctorToChangeStatus.set(null);
    this.doctorDocuments.set([]);
    this.isStatusModalVisible.set(false);
    this.modalSelectedStatus = '';
    this.modalStatusChangeReason = '';
  }

  downloadDocument(doctorId: number, documentId: number): void {
    if (!doctorId || !documentId) {
      console.error('Invalid doctor ID or document ID');
      this.toastService.error('Erro: IDs inválidos para download');
      return;
    }

    this.doctorManagementService.downloadDocument(doctorId, documentId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document_${documentId}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.toastService.success('Download iniciado com sucesso');
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao baixar documento:', err);
        this.toastService.error('Erro ao baixar documento');
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getDocumentTypeLabel(type: string): string {
    const types: Record<string, string> = {
      'CRM_CERTIFICATE': 'Certificado CRM',
      'DIPLOMA': 'Diploma',
      'IDENTITY': 'Identidade',
      'CPF_DOCUMENT': 'Documento CPF',
      'PROOF_OF_ADDRESS': 'Comprovante de Residência',
      'OTHER': 'Outro'
    };
    return types[type] || type;
  }

  getDocumentIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z';
    } else if (mimeType === 'application/pdf') {
      return 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z';
    } else {
      return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
    }
  }

  confirmStatusChange(): void {
    const doctor = this.doctorToChangeStatus();
    if (!doctor) {
      return;
    }

    const statusData: ChangeStatusData = {
      status: this.modalSelectedStatus as any,
      reason: this.modalStatusChangeReason || undefined,
    };

    this.doctorManagementService
      .changeDoctorStatus(doctor.id, statusData)
      .subscribe({
        next: () => {
          this.toastService.success('Status do médico alterado com sucesso');
          this.loadUsers();
          this.closeStatusModal();
        },
        error: (err) => {
          this.toastService.error('Erro ao alterar status do médico');
          console.error(err);
          this.closeStatusModal();
        },
      });
  }

  private mapApprovalStatusToBackend(status: string): string {
    const mapping: Record<string, string> = {
      'pendente': 'pending',
      'aprovado(a)': 'approved',
      'rejeitado(a)': 'rejected',
      'suspenso(a)': 'suspended',
      'em_revisao': 'in_review'
    };
    return mapping[status] || status;
  }
}
