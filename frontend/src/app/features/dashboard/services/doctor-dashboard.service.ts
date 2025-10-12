import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Patient,
  PaginatedPatients,
  PatientFilters,
} from '../../../core/models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class DoctorDashboardService {
  private mockPatients: Patient[] = [
    {
      id: '1',
      name: 'Ana Ferreira',
      age: 68,
      cpf: '123.456.789-00',
      status: 'stable',
      lastTestDate: '2025-08-09',
      lastTestType: 'spiral',
      testsCount: 15,
    },
    {
      id: '2',
      name: 'Carlos Santos',
      age: 72,
      cpf: '234.567.890-11',
      status: 'critical',
      lastTestDate: '2025-08-10',
      lastTestType: 'voice',
      testsCount: 23,
    },
    {
      id: '3',
      name: 'João Silva',
      age: 65,
      cpf: '345.678.901-22',
      status: 'attention',
      lastTestDate: '2025-08-08',
      lastTestType: 'spiral',
      testsCount: 8,
    },
    {
      id: '4',
      name: 'Maria Oliveira',
      age: 70,
      cpf: '456.789.012-33',
      status: 'stable',
      lastTestDate: '2025-08-07',
      lastTestType: 'voice',
      testsCount: 12,
    },
    {
      id: '5',
      name: 'Pedro Almeida',
      age: 75,
      cpf: '567.890.123-44',
      status: 'attention',
      lastTestDate: '2025-08-06',
      lastTestType: 'spiral',
      testsCount: 19,
    },
    {
      id: '6',
      name: 'Beatriz Costa',
      age: 63,
      cpf: '678.901.234-55',
      status: 'stable',
      lastTestDate: '2025-08-05',
      lastTestType: 'voice',
      testsCount: 7,
    },
    {
      id: '7',
      name: 'Roberto Lima',
      age: 69,
      cpf: '789.012.345-66',
      status: 'critical',
      lastTestDate: '2025-08-04',
      lastTestType: 'spiral',
      testsCount: 31,
    },
    {
      id: '8',
      name: 'Claudia Rocha',
      age: 71,
      cpf: '890.123.456-77',
      status: 'stable',
      lastTestDate: '2025-08-03',
      lastTestType: 'voice',
      testsCount: 14,
    },
    {
      id: '9',
      name: 'Fernando Souza',
      age: 67,
      cpf: '901.234.567-88',
      status: 'attention',
      lastTestDate: '2025-08-02',
      lastTestType: 'spiral',
      testsCount: 11,
    },
    {
      id: '10',
      name: 'Julia Martins',
      age: 64,
      cpf: '012.345.678-99',
      status: 'stable',
      lastTestDate: '2025-08-01',
      lastTestType: 'voice',
      testsCount: 6,
    },
    {
      id: '11',
      name: 'Antonio Cardoso',
      age: 73,
      cpf: '111.222.333-44',
      status: 'critical',
      lastTestDate: '2025-07-31',
      lastTestType: 'spiral',
      testsCount: 28,
    },
    {
      id: '12',
      name: 'Isabel Nunes',
      age: 66,
      cpf: '222.333.444-55',
      status: 'stable',
      lastTestDate: '2025-07-30',
      lastTestType: 'voice',
      testsCount: 9,
    },
  ];

  readonly patients = signal<Patient[]>(this.mockPatients.slice(0, 3));

  constructor() {}

  getPatientsPage(
    page: number,
    pageSize: number,
    filters?: PatientFilters
  ): Observable<PaginatedPatients> {
    let filteredPatients = [...this.mockPatients];

    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredPatients = filteredPatients.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.cpf?.includes(query) ||
          false
      );
    }

    if (filters?.status) {
      filteredPatients = filteredPatients.filter(
        (p) => p.status === filters.status
      );
    }

    if (filters?.testType) {
      filteredPatients = filteredPatients.filter(
        (p) => p.lastTestType === filters.testType
      );
    }

    const total = filteredPatients.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const patients = filteredPatients.slice(startIndex, endIndex);

    const result: PaginatedPatients = {
      patients,
      total,
      page,
      pageSize,
      totalPages,
    };

    return of(result).pipe(delay(500));
  }

  searchPatients(
    query: string,
    filters: PatientFilters = {}
  ): Observable<Patient[]> {
    const searchFilters: PatientFilters = {
      ...filters,
      searchQuery: query,
    };

    return new Observable((observer) => {
      this.getPatientsPage(1, 100, searchFilters).subscribe((result) => {
        observer.next(result.patients);
        observer.complete();
      });
    });
  }
}
