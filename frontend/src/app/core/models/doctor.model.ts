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
  created_at?: string;
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

export interface DoctorDocument {
  id: number;
  doctor_id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  verified: boolean;
}
