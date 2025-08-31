import { Injectable, signal } from '@angular/core';

export interface Patient {
  id: string;
  name: string;
  status: 'stable' | 'attention' | 'critical';
  lastTestDate: string;
}

@Injectable({
  providedIn: 'root',
})
export class DoctorDashboardService {
  readonly patients = signal<Patient[]>([
    {
      id: '1',
      name: 'Ana Ferreira',
      status: 'stable',
      lastTestDate: '2025-08-09',
    },
    {
      id: '2',
      name: 'Carlos Santos',
      status: 'critical',
      lastTestDate: '2025-08-10',
    },
    {
      id: '3',
      name: 'João Silva',
      status: 'attention',
      lastTestDate: '2025-08-08',
    },
  ]);
}
