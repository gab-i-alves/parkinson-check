export interface Doctor {
  id: number;
  name: string;
  expertise_area: string;
  crm: string;
  location: string;
  status?: 'pending' | 'linked' | 'unlinked';
  bindingId?: number;
  bind_id?: number; 
}
