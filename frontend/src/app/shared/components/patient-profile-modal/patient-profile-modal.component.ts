import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CpfPipe } from '../../pipes/cpf.pipe';

export interface PatientProfile {
  id: string;
  name: string;
  age?: number;
  cpf?: string;
  email: string;
  status?: 'stable' | 'attention' | 'critical' | 'pending' | 'linked' | 'unlinked';
}

@Component({
  selector: 'app-patient-profile-modal',
  standalone: true,
  imports: [CommonModule, CpfPipe],
  templateUrl: './patient-profile-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientProfileModalComponent {
  @Input() patient: PatientProfile | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  getStatusText(status?: string): string {
    const statusMap: { [key: string]: string } = {
      stable: 'Estável',
      attention: 'Atenção',
      critical: 'Crítico',
      pending: 'Solicitação Pendente',
      linked: 'Vinculado',
      unlinked: 'Não Vinculado',
    };
    return status ? statusMap[status] || 'Desconhecido' : 'Não Vinculado';
  }

  getStatusClass(status?: string): string {
    const classMap: { [key: string]: string } = {
      stable: 'bg-green-100 text-green-800',
      attention: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      linked: 'bg-green-100 text-green-800',
      unlinked: 'bg-gray-100 text-gray-800',
    };
    return status ? classMap[status] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }
}
