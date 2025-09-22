export interface PatientRegisterForm {
  name: string;
  birthdate: string;
  cpf: string;
  email: string;
  password?: string;
  cep: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
}

export interface DoctorRegisterForm extends PatientRegisterForm {
  crm: string;
  expertise_area: string;
}
