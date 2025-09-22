export interface PatientBindingRequest {
  id: number;
  doctor: {
    id: number;
    name: string;
    expertise_area: string;
  };
}
