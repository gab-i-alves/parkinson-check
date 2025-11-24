import { UserRole } from './user.model';

export interface LoginForm {
  email: string;
  password?: string;
  remember?: boolean;
  selectedRole?: UserRole;
}
