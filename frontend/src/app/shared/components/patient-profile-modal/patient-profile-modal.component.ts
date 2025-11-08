import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  cpf?: string;
  email?: string;
  status?: 'stable' | 'attention' | 'critical' | 'pending' | 'linked' | 'unlinked';
  lastTestDate?: string;
  testsCount?: number;
}

@Component({
  selector: 'app-patient-profile-modal',
  standalone: true,
  imports: [CommonModule],
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
      stable: 'text-green-600',
      attention: 'text-yellow-600',
      critical: 'text-red-600',
      pending: 'text-yellow-600',
      linked: 'text-green-600',
      unlinked: 'text-gray-500',
    };
    return status ? classMap[status] || 'text-gray-500' : 'text-gray-500';
  }
}
