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
import { HttpErrorResponse } from '@angular/common/http';
import { CpfPipe } from '../../../../../shared/pipes/cpf.pipe';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { TooltipDirective } from '../../../../../shared/directives/tooltip.directive';
import { formatDate } from '../../../shared/utils/display-helpers';
import { ActivityTimelineComponent, Activity } from '../../../../../shared/components/activity-timeline/activity-timeline.component';

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
    DocumentViewerModalComponent,
    BadgeComponent,
    FormsModule,
    CpfPipe,
    ConfirmationModalComponent,
    TooltipDirective,
    ActivityTimelineComponent
  ],
  templateUrl: './doctor-approval.component.html',
})
export class DoctorApprovalComponent implements OnInit {
  doctor = signal<DoctorForApproval | null>(null);
  documents = signal<DoctorDocument[]>([]);
  activities = signal<Activity[]>([]);
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
    this.doctorManagementService.getDoctorById(doctorId).subscribe({
      next: (doctor: any) => {
        if (doctor) {
          this.doctor.set({
            id: doctor.id,
            name: doctor.name,
            email: doctor.email,
            cpf: doctor.cpf || '',
            crm: doctor.crm,
            expertise_area: doctor.specialty,
            experience_level: doctor.experience_level || '',
            status: doctor.status,
            location: doctor.location
          });

          // Create timeline activities based on doctor data
          this.createTimelineActivities(doctor);
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

  openApproveModal(): void {
    this.isApproveModalOpen.set(true);
  }

  closeApproveModal(): void {
    this.isApproveModalOpen.set(false);
  }

  confirmApproval(): void {
    const doctor = this.doctor();
    if (!doctor) return;

    this.doctorManagementService.approveDoctor(doctor.id, {}).subscribe({
      next: () => {
        this.toastService.success('Médico aprovado com sucesso! Email de notificação enviado.');
        this.closeApproveModal();
        this.router.navigate(['/dashboard/doctors']);
      },
      error: (err: any) => {
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
      error: (err: any) => {
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
    return formatDate(dateString || null);
  }

  createTimelineActivities(doctor: any): void {
    const activities: Activity[] = [];

    // Registration activity
    if (doctor.created_at || doctor.registration_date) {
      activities.push({
        id: 1,
        activity_type: 'REGISTRATION',
        description: `Cadastro realizado no sistema como médico ${doctor.specialty ? 'da área de ' + doctor.specialty : ''}`,
        created_at: doctor.created_at || doctor.registration_date
      });
    }

    // Status change activity if not pending
    if (doctor.status && doctor.status !== 'PENDING') {
      const statusDescriptions: Record<string, string> = {
        'IN_REVIEW': 'Cadastro em revisão pela equipe administrativa',
        'APPROVED': 'Cadastro aprovado - acesso ao sistema liberado',
        'REJECTED': 'Cadastro rejeitado',
        'SUSPENDED': 'Cadastro suspenso'
      };

      activities.push({
        id: 2,
        activity_type: 'STATUS_CHANGE',
        description: statusDescriptions[doctor.status] || `Status alterado para ${doctor.status}`,
        created_at: doctor.updated_at || doctor.created_at || new Date().toISOString()
      });
    }

    // Documents uploaded
    if (this.documents().length > 0) {
      activities.push({
        id: 3,
        activity_type: 'NOTE_ADDED',
        description: `${this.documents().length} documento(s) enviado(s) para verificação`,
        created_at: doctor.created_at || new Date().toISOString()
      });
    }

    this.activities.set(activities.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ));
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
