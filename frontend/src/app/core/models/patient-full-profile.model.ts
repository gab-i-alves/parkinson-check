export interface AddressResponse {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
}

export interface PatientFullProfile {
  id: number;
  name: string;
  cpf: string;
  email: string;
  birthdate: string; // ISO date string
  age: number;
  address: AddressResponse;
  status: 'stable' | 'attention' | 'critical';
  bind_id: number;
  created_at?: string; // ISO datetime string
}
