import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DoctorManagementService } from '../../services/doctor-management.service';
import {
  DocumentViewerModalComponent,
  DoctorDocument
} from '../../../../shared/components/document-viewer-modal/document-viewer-modal.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../shared/services/toast.service';

interface DoctorForApproval {
  id: number;
  name: string;
  email: string;
  cpf: string;
  crm: string;
  expertise_area: string;
  experience_level: string;
  status: string;
  location: string;
  birthdate?: string;
  gender?: string;
}

@Component({
  selector: 'app-doctor-approval',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DocumentViewerModalComponent,
    BadgeComponent,
    FormsModule
  ],
  templateUrl: './doctor-approval.component.html',
})
export class DoctorApprovalComponent implements OnInit {
  doctor = signal<DoctorForApproval | null>(null);
  documents = signal<DoctorDocument[]>([]);
  isLoading = signal<boolean>(true);

  isDocumentModalOpen = signal<boolean>(false);
  isRejectModalOpen = signal<boolean>(false);
  isApproveModalOpen = signal<boolean>(false);

  rejectionReason: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorManagementService: DoctorManagementService,
    private toastService: ToastService
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
    this.doctorManagementService.getDoctors().subscribe({
      next: (response) => {
        const doctor = response.doctors.find(d => d.id === doctorId);
        if (doctor) {
          this.doctor.set(doctor as DoctorForApproval);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes do médico:', err);
        this.toastService.error('Erro ao carregar detalhes do médico');
        this.isLoading.set(false);
      }
    });
  }

  loadDoctorDocuments(doctorId: number): void {
    this.doctorManagementService.getDoctorDocuments(doctorId).subscribe({
      next: (docs) => {
        this.documents.set(docs);
      },
      error: (err) => {
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
    this.doctorManagementService.downloadDocument(event.doctorId, event.documentId).subscribe({
      next: (blob) => {
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
      error: (err) => {
        console.error('Erro ao baixar documento:', err);
        this.toastService.error('Erro ao baixar documento');
      }
    });
  }

  openApproveModal(): void {
    this.isApproveModalOpen.set(true);
  }

  closeApproveModal(): void {
    this.isApproveModalOpen.set(false);
  }

  confirmApproval(): void {
    const doctor = this.doctor();
    if (!doctor) return;

    this.doctorManagementService.approveDoctor(doctor.id).subscribe({
      next: () => {
        this.toastService.success('Médico aprovado com sucesso! Email de notificação enviado.');
        this.closeApproveModal();
        this.router.navigate(['/dashboard/doctors']);
      },
      error: (err) => {
        console.error('Erro ao aprovar médico:', err);
        this.toastService.error('Erro ao aprovar médico');
        this.closeApproveModal();
      }
    });
  }

  openRejectModal(): void {
    this.isRejectModalOpen.set(true);
  }

  closeRejectModal(): void {
    this.isRejectModalOpen.set(false);
    this.rejectionReason = '';
  }

  confirmRejection(): void {
    const doctor = this.doctor();
    if (!doctor) return;

    if (!this.rejectionReason || this.rejectionReason.trim() === '') {
      this.toastService.error('Por favor, informe o motivo da rejeição');
      return;
    }

    this.doctorManagementService.rejectDoctor(doctor.id, this.rejectionReason).subscribe({
      next: () => {
        this.toastService.success('Médico rejeitado. Email de notificação enviado.');
        this.closeRejectModal();
        this.router.navigate(['/dashboard/doctors']);
      },
      error: (err) => {
        console.error('Erro ao rejeitar médico:', err);
        this.toastService.error('Erro ao rejeitar médico');
        this.closeRejectModal();
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

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
