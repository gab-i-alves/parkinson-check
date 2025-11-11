export type UserRole = 'paciente' | 'medico' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  cpf?: string;
  status?: boolean;
  location?: string;
  createdAt?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  role: UserRole;
  email: string;
  avatarUrl?: string;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserFilters {
  status?: number;
  userType?: UserRole;
  searchQuery?: string;
}