export type UserRole = 'paciente' | 'medico' | 'admin';

export interface UserProfile {
  name: string;
  role: 'paciente' | 'medico' | 'admin';
  email: string;
  avatarUrl?: string;
}
