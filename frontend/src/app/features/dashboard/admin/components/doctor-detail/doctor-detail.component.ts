import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorManagementService } from '../../../services/doctor-management.service';
import {
  DocumentViewerModalComponent,
  DoctorDocument
} from '../../../../../shared/components/document-viewer-modal/document-viewer-modal.component';
import {
  ActivityTimelineComponent,
  Activity
} from '../../../../../shared/components/activity-timeline/activity-timeline.component';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../../shared/services/toast.service';
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
  experience_level: string;
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
    ActivityTimelineComponent,
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
  activities = signal<Activity[]>([]);
  isLoading = signal<boolean>(true);

  isDocumentModalOpen = signal<boolean>(false);
  isStatusModalOpen = signal<boolean>(false);
  isEditingDetails = signal<boolean>(false);

  selectedStatus: string = '';
  statusChangeReason: string = '';
  editedExpertiseArea: string = '';
  editedExperienceLevel: string = '';

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
            location: doctor.location,
            approval_date: doctor.approval_date,
            rejection_reason: doctor.reason,
            approved_by_admin_id: undefined
          });
          this.selectedStatus = doctor.status;

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

  openStatusModal(): void {
    this.isStatusModalOpen.set(true);
  }

  closeStatusModal(): void {
    this.isStatusModalOpen.set(false);
    this.statusChangeReason = '';
  }

  confirmStatusChange(): void {
    const doctor = this.doctor();
    if (!doctor || !doctor.id) {
      console.error('Doctor or doctor ID is undefined');
      this.toastService.error('Erro: ID do médico não encontrado');
      return;
    }

    const statusData = {
      status: this.selectedStatus as any,
      reason: this.statusChangeReason || undefined
    };

    this.doctorManagementService.changeDoctorStatus(doctor.id, statusData).subscribe({
      next: () => {
        this.toastService.success('Status atualizado com sucesso');
        this.closeStatusModal();
        this.loadDoctorDetails(doctor.id);
      },
      error: (error) => {
        console.error('Erro ao atualizar status:', error);
        this.toastService.error('Erro ao atualizar status do médico');
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

  getExperienceLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      'JUNIOR': 'Júnior',
      'INTERMEDIATE': 'Intermediário',
      'SENIOR': 'Sênior',
      'EXPERT': 'Especialista'
    };
    return labels[level] || level;
  }

  formatDateDisplay(dateString: string | undefined): string {
    return formatDate(dateString || null);
  }

  startEditingDetails(): void {
    const doctor = this.doctor();
    if (doctor) {
      this.editedExpertiseArea = doctor.expertise_area || '';
      this.editedExperienceLevel = doctor.experience_level || '';
      this.isEditingDetails.set(true);
    }
  }

  cancelEditingDetails(): void {
    this.isEditingDetails.set(false);
    this.editedExpertiseArea = '';
    this.editedExperienceLevel = '';
  }

  saveDetails(): void {
    const doctor = this.doctor();
    if (!doctor) return;

    const details: any = {};
    if (this.editedExpertiseArea) details.expertise_area = this.editedExpertiseArea;
    if (this.editedExperienceLevel) details.experience_level = this.editedExperienceLevel;

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

  createTimelineActivities(doctor: any): void {
    const activities: Activity[] = [];

    // Registration activity
    if (doctor.created_at || doctor.registration_date) {
      activities.push({
        id: 1,
        activity_type: 'REGISTRATION',
        description: `Cadastro realizado no sistema como médico${doctor.specialty ? ' da área de ' + doctor.specialty : ''}`,
        created_at: doctor.created_at || doctor.registration_date
      });
    }

    // Status change activities based on current status
    if (doctor.status) {
      const statusDescriptions: Record<string, string> = {
        'IN_REVIEW': 'Cadastro em revisão pela equipe administrativa',
        'APPROVED': 'Cadastro aprovado - acesso ao sistema liberado',
        'REJECTED': 'Cadastro rejeitado',
        'SUSPENDED': 'Cadastro suspenso'
      };

      if (doctor.status !== 'PENDING' && statusDescriptions[doctor.status]) {
        activities.push({
          id: 2,
          activity_type: 'STATUS_CHANGE',
          description: statusDescriptions[doctor.status],
          created_at: doctor.updated_at || doctor.approval_date || doctor.created_at || new Date().toISOString()
        });
      }
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

    // Sort by date (most recent first)
    this.activities.set(activities.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ));
  }

  goBack(): void {
    this.router.navigate(['/dashboard/doctors']);
  }
}
