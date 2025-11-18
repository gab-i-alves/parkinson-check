import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DoctorDocument {
  id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  verified: boolean;
}

@Component({
  selector: 'app-document-viewer-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-viewer-modal.component.html',
})
export class DocumentViewerModalComponent {
  // Inputs using modern signals API
  documents = input.required<DoctorDocument[]>();
  isOpen = input<boolean>(false);

  // Outputs
  close = output<void>();
  download = output<{ doctorId: number; documentId: number }>();

  doctorId = input.required<number>();

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    this.close.emit();
  }

  onDownload(documentId: number): void {
    this.download.emit({
      doctorId: this.doctorId(),
      documentId: documentId,
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
