import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DoctorManagementService } from '../../services/doctor-management.service';
import {
  DocumentViewerModalComponent,
  DoctorDocument
} from '../../../../shared/components/document-viewer-modal/document-viewer-modal.component';
import {
  ActivityTimelineComponent,
  Activity
} from '../../../../shared/components/activity-timeline/activity-timeline.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../shared/services/toast.service';

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
    RouterLink,
    DocumentViewerModalComponent,
    ActivityTimelineComponent,
    BadgeComponent,
    FormsModule
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

  selectedStatus: string = '';
  statusChangeReason: string = '';

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
          this.doctor.set(doctor as DoctorDetail);
          this.selectedStatus = doctor.status;
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

  openStatusModal(): void {
    this.isStatusModalOpen.set(true);
  }

  closeStatusModal(): void {
    this.isStatusModalOpen.set(false);
    this.statusChangeReason = '';
  }

  confirmStatusChange(): void {
    const doctor = this.doctor();
    if (!doctor) return;

    // TODO: Implementar chamada ao service quando o endpoint estiver pronto
    console.log('Mudando status para:', this.selectedStatus, 'Motivo:', this.statusChangeReason);

    this.closeStatusModal();
    this.toastService.success('Status atualizado com sucesso');

    // Recarregar detalhes
    this.loadDoctorDetails(doctor.id);
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

  goBack(): void {
    this.router.navigate(['/dashboard/doctors']);
  }
}
