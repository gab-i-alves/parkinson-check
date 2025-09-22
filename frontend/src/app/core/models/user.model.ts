export type UserRole = 'paciente' | 'medico' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface UserProfile {
  id: number;
  name: string;
  role: UserRole;
  email: string;
  avatarUrl?: string;
}
