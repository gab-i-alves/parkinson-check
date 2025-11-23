import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DoctorManagementService } from '../../../services/doctor-management.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { TooltipDirective } from '../../../../../shared/directives/tooltip.directive';
import { CpfPipe } from '../../../../../shared/pipes/cpf.pipe';
import { ToastService } from '../../../../../shared/services/toast.service';
import { BreadcrumbService } from '../../../../../shared/services/breadcrumb.service';
import { formatDate } from '../../../shared/utils/display-helpers';
import { DoctorDocument } from '../../../../../shared/components/document-viewer-modal/document-viewer-modal.component';

interface DoctorDetail {
  id: number;
  name: string;
  email: string;
  cpf: string;
  crm: string;
  expertise_area: string;
  status: string;
  location: string;
  birthdate?: string;
  gender?: number;
  address?: any;
  approval_date?: string;
  rejection_reason?: string;
}

@Component({
  selector: 'app-edit-doctor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BadgeComponent,
    TooltipDirective,
    CpfPipe
  ],
  templateUrl: './edit-doctor.component.html',
})
export class EditDoctorComponent implements OnInit {
  doctor = signal<DoctorDetail | undefined>(undefined);
  documents = signal<DoctorDocument[]>([]);

  isSaveConfirmModalVisible = signal<boolean>(false);

  editForm!: FormGroup;
  isLoading = false;
  apiError: string | null = null;
  public Number = Number;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private doctorManagementService: DoctorManagementService,
    private router: Router,
    private toastService: ToastService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    this.editForm = this.formBuilder.group({
      name: [''],
      email: [''],
      birthdate: [''],
      gender: [''],
      crm: [''],
      expertise_area: [''],
      cep: [''],
      street: [''],
      number: [''],
      complement: [''],
      neighborhood: [''],
      city: [''],
      state: ['']
    });

    this.route.paramMap.subscribe((params) => {
      const idString = params.get('id');

      if (idString) {
        this.loadDoctor(Number(idString));
        this.loadDoctorDocuments(Number(idString));
      } else {
        console.error('ID do médico não fornecido na rota.');
      }
    });
  }

  loadDoctor(doctorId: number) {
    this.doctorManagementService.getDoctorById(doctorId).subscribe({
      next: (doctor: any) => {
        if (doctor) {
          // Salvar dados do médico diretamente do backend
          this.doctor.set({
            id: doctorId,
            name: doctor.name,
            email: doctor.email,
            cpf: doctor.cpf,
            crm: doctor.crm,
            expertise_area: doctor.specialty,
            status: doctor.status,
            location: doctor.location,
            birthdate: doctor.birthdate,
            gender: doctor.gender,
            address: doctor.address,
            approval_date: doctor.approval_date,
            rejection_reason: doctor.reason
          } as any);

          // Atualizar breadcrumb com nome do médico
          this.breadcrumbService.updateBreadcrumb(this.router.url, doctor.name);

          // Preencher formulário com dados atuais
          this.editForm.patchValue({
            name: doctor.name || '',
            email: doctor.email || '',
            birthdate: doctor.birthdate || '',
            gender: doctor.gender ? doctor.gender.toString() : '',
            crm: doctor.crm || '',
            expertise_area: doctor.specialty || '',
            cep: doctor.address?.cep || '',
            street: doctor.address?.street || '',
            number: doctor.address?.number || '',
            complement: doctor.address?.complement || '',
            neighborhood: doctor.address?.neighborhood || '',
            city: doctor.address?.city || '',
            state: doctor.address?.state || ''
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Falha na api de busca:', err);
        this.toastService.error('Erro ao carregar dados do médico');
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

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.toastService.error('Por favor, preencha todos os campos obrigatórios corretamente');
      return;
    }

    // Mostrar modal de confirmação ao invés de salvar diretamente
    this.isSaveConfirmModalVisible.set(true);
  }

  cancelSave(): void {
    this.isSaveConfirmModalVisible.set(false);
  }

  confirmSave(): void {
    this.isSaveConfirmModalVisible.set(false);

    this.isLoading = true;
    this.editForm.disable();
    this.apiError = null;

    // Preparar payload com conversão de tipos
    const formValue = this.editForm.value;
    const payload = {
      ...formValue,
      gender: formValue.gender ? parseInt(formValue.gender, 10) : undefined
    };

    console.log('Dados atualizados:', payload);

    this.doctorManagementService
      .updateDoctorDetails(this.doctor()!.id, payload)
      .subscribe({
        next: (response: any) => {
          console.log('Edição de perfil realizada', response);
          this.toastService.success('Dados do médico atualizados com sucesso');
          this.router.navigate(['/dashboard/admin/doctors']);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erro ao atualizar médico:', err);
          const errorMessage = err.error?.detail || 'Ocorreu um erro ao atualizar o médico.';
          this.apiError = errorMessage;
          this.toastService.error(errorMessage);
          this.isLoading = false;
          this.editForm.enable();
        },
      });
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

  getUserTypeLabel(): string {
    return 'Médico';
  }

  getUserTypeBadgeVariant(): any {
    return 'success';
  }

  formatDateDisplay(dateString: string | null | undefined): string {
    return formatDate(dateString || null);
  }

  downloadDocument(documentId: number): void {
    const doctorId = this.doctor()?.id;
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
}
