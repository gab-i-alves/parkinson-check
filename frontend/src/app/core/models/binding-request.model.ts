// Enum for binding status
export enum BindEnum {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REVERSED = 'REVERSED',
  REJECTED = 'REJECTED'
}

// Patient information in binding
export interface BindingPatient {
  id: number;
  name: string;
  email: string;
}

// Doctor information in binding
export interface BindingDoctor {
  id: number;
  name: string;
  specialty: string;
}

// Unified binding request response (used by both doctors and patients)
export interface BindingRequestResponse {
  id: number;
  user: BindingPatient | BindingDoctor;
  status: BindEnum;
}

// Legacy interface - kept for backwards compatibility during migration
export interface BindingRequest {
  id: number;
  patient: {
    id: number;
    name: string;
    email: string;
  };
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
}

// Type guard to check if user is a patient
export function isBindingPatient(user: BindingPatient | BindingDoctor): user is BindingPatient {
  return 'email' in user;
}

// Type guard to check if user is a doctor
export function isBindingDoctor(user: BindingPatient | BindingDoctor): user is BindingDoctor {
  return 'specialty' in user;
}
