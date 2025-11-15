export type UserRole = 'paciente' | 'medico' | 'admin';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  gender: Gender;
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
  gender: Gender;
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