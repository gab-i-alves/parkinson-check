export type PatientStatus = 'stable' | 'attention' | 'critical';
export type TestType = 'spiral' | 'voice';

export interface Patient {
  id: string;
  name: string;
  age: number;
  cpf?: string;
  email?: string;
  status: PatientStatus;
  lastTestDate: string;
  lastTestType?: TestType;
  testsCount: number;
  bindingId?: number;
}

export interface PaginatedPatients {
  patients: Patient[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PatientFilters {
  status?: PatientStatus;
  testType?: TestType;
  searchQuery?: string;
}
