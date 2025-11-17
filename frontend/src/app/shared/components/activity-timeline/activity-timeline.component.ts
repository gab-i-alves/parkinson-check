import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Activity {
  id: number;
  activity_type: string;
  description: string;
  created_at: string;
}

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-timeline.component.html',
})
export class ActivityTimelineComponent {
  // Input using modern signals API
  activities = input.required<Activity[]>();

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      'REGISTRATION': 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
      'LOGIN': 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1',
      'STATUS_CHANGE': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'PATIENT_BOUND': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      'PATIENT_UNBOUND': 'M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6',
      'NOTE_ADDED': 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      'NOTE_UPDATED': 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
      'NOTE_DELETED': 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
    };
    return icons[type] || icons['LOGIN'];
  }

  getActivityColor(type: string): { bg: string; text: string; ring: string } {
    const colors: Record<string, { bg: string; text: string; ring: string }> = {
      'REGISTRATION': { bg: 'bg-green-100', text: 'text-green-700', ring: 'ring-green-200' },
      'LOGIN': { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-200' },
      'STATUS_CHANGE': { bg: 'bg-yellow-100', text: 'text-yellow-700', ring: 'ring-yellow-200' },
      'PATIENT_BOUND': { bg: 'bg-purple-100', text: 'text-purple-700', ring: 'ring-purple-200' },
      'PATIENT_UNBOUND': { bg: 'bg-pink-100', text: 'text-pink-700', ring: 'ring-pink-200' },
      'NOTE_ADDED': { bg: 'bg-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-200' },
      'NOTE_UPDATED': { bg: 'bg-cyan-100', text: 'text-cyan-700', ring: 'ring-cyan-200' },
      'NOTE_DELETED': { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-200' }
    };
    return colors[type] || colors['LOGIN'];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Agora mesmo';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'} atrás`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'} atrás`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'} atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  getActivityTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'REGISTRATION': 'Cadastro',
      'LOGIN': 'Login',
      'STATUS_CHANGE': 'Mudança de Status',
      'PATIENT_BOUND': 'Paciente Vinculado',
      'PATIENT_UNBOUND': 'Paciente Desvinculado',
      'NOTE_ADDED': 'Nota Adicionada',
      'NOTE_UPDATED': 'Nota Atualizada',
      'NOTE_DELETED': 'Nota Removida'
    };
    return labels[type] || type;
  }
}
