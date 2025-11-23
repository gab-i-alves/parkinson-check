import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorManagementService } from '../../../services/doctor-management.service';
import {
  DocumentViewerModalComponent,
  DoctorDocument
} from '../../../../../shared/components/document-viewer-modal/document-viewer-modal.component';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../../shared/services/toast.service';
import { BreadcrumbService } from '../../../../../shared/services/breadcrumb.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CpfPipe } from '../../../../../shared/pipes/cpf.pipe';
import { TooltipDirective } from '../../../../../shared/directives/tooltip.directive';
import { formatDate } from '../../../shared/utils/display-helpers';

interface DoctorDetail {
  id: number;
  name: string;
  email: string;
  cpf: string;
  crm: string;
  expertise_area: string;
  status: string;
  location: string;
  approval_date?: string;
  rejection_reason?: string;
  approved_by_admin_id?: number;
}

@Component({
  selector: 'app-doctor-detail',
  standalone: true,
  imports: [
    CommonModule,
    DocumentViewerModalComponent,
    BadgeComponent,
    FormsModule,
    CpfPipe,
    TooltipDirective
  ],
  templateUrl: './doctor-detail.component.html',
})
export class DoctorDetailComponent implements OnInit {
  doctor = signal<DoctorDetail | null>(null);
  documents = signal<DoctorDocument[]>([]);
  isLoading = signal<boolean>(true);

  isDocumentModalOpen = signal<boolean>(false);
  isEditingDetails = signal<boolean>(false);

  editedExpertiseArea: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorManagementService: DoctorManagementService,
    private toastService: ToastService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    const doctorId = this.route.snapshot.paramMap.get('id');
    if (doctorId) {
      this.loadDoctorDetails(Number(doctorId));
      this.loadDoctorDocuments(Number(doctorId));
    }
  }

  loadDoctorDetails(doctorId: number): void {
    this.isLoading.set(true);
    this.doctorManagementService.getDoctorById(doctorId).subscribe({
      next: (doctor: any) => {
        if (doctor) {
          console.log('[Doctor Detail] Doctor data received:', doctor);
          console.log('[Doctor Detail] Doctor ID:', doctor.id);
          this.doctor.set({
            id: doctor.id,
            name: doctor.name,
            email: doctor.email,
            cpf: doctor.cpf || '',
            crm: doctor.crm,
            expertise_area: doctor.specialty,
            status: doctor.status,
            location: doctor.location,
            approval_date: doctor.approval_date,
            rejection_reason: doctor.reason,
            approved_by_admin_id: undefined
          });
          console.log('[Doctor Detail] Doctor signal set:', this.doctor());
          console.log('[Doctor Detail] Button should be enabled?', !!this.doctor() && !!this.doctor()?.id);

          // Atualizar breadcrumb com nome do médico
          this.breadcrumbService.updateBreadcrumb(this.router.url, doctor.name);
        }
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar detalhes do médico:', err);
        this.toastService.error('Erro ao carregar detalhes do médico');
        this.isLoading.set(false);
      }
    });
  }

  loadDoctorDocuments(doctorId: number): void {
    this.doctorManagementService.getDoctorDocuments(doctorId).subscribe({
      next: (docs: DoctorDocument[]) => {
        this.documents.set(docs);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar documentos:', err);
      }
    });
  }

  openDocumentModal(): void {
    this.isDocumentModalOpen.set(true);
  }

  closeDocumentModal(): void {
    this.isDocumentModalOpen.set(false);
  }

  downloadDocument(event: { doctorId: number; documentId: number }): void {
    // Validate IDs before download
    if (!event.doctorId || !event.documentId) {
      console.error('Invalid doctor ID or document ID:', event);
      this.toastService.error('Erro: IDs inválidos para download');
      return;
    }

    this.doctorManagementService.downloadDocument(event.doctorId, event.documentId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document_${event.documentId}`;
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

  getStatusBadgeVariant(status: string): any {
    const variants: Record<string, any> = {
      'PENDING': 'warning',
      'APPROVED': 'success',
      'REJECTED': 'error',
      'SUSPENDED': 'error',
      'IN_REVIEW': 'info'
    };
    return variants[status] || 'neutral';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'Pendente',
      'APPROVED': 'Aprovado',
      'REJECTED': 'Rejeitado',
      'SUSPENDED': 'Suspenso',
      'IN_REVIEW': 'Em Revisão'
    };
    return labels[status] || status;
  }

  formatDateDisplay(dateString: string | undefined): string {
    return formatDate(dateString || null);
  }

  startEditingDetails(): void {
    const doctor = this.doctor();
    if (doctor) {
      this.editedExpertiseArea = doctor.expertise_area || '';
      this.isEditingDetails.set(true);
    }
  }

  cancelEditingDetails(): void {
    this.isEditingDetails.set(false);
    this.editedExpertiseArea = '';
  }

  saveDetails(): void {
    const doctor = this.doctor();
    if (!doctor) return;

    const details: any = {};
    if (this.editedExpertiseArea) details.expertise_area = this.editedExpertiseArea;

    this.doctorManagementService.updateDoctorDetails(doctor.id, details).subscribe({
      next: () => {
        this.toastService.success('Dados atualizados com sucesso');
        this.isEditingDetails.set(false);
        this.loadDoctorDetails(doctor.id);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erro ao atualizar dados:', error);
        this.toastService.error('Erro ao atualizar dados do médico');
      }
    });
  }
}
