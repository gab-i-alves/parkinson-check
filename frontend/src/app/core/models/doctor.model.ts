export type DoctorStatus = 'pendente' | 'aprovado(a)' | 'rejeitado(a)'| 'suspenso(a)'| 'em_revisao';


export interface Doctor {
  id: number;
  name: string;
  expertise_area: string;
  crm: string;
  location: string;
  status?: 'pending' | 'linked' | 'unlinked';
  bindingId?: number;
  bind_id?: number; 
  approval_status?: DoctorStatus
  approved_by?: string
  approval_date?: string
  email?: string
  cpf?: string
}

export interface PaginatedDoctors {
  doctors: Doctor[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DoctorFilters {
  area?: string;
  approval_status?: DoctorStatus | '';
  searchQuery?: string;
}