export interface DoctorInfo {
  id: number;
  name: string;
  crm: string;
}

export interface Note {
  id: number;
  content: string;
  test_id: number;
  parent_note_id: number | null;
  patient_view: boolean;
  doctor_id: number;
  doctor: DoctorInfo;
  linked_notes?: Note[];
  parent_note?: Note;
}

export interface CreateNoteRequest {
  content: string;
  test_id: number;
  parent_note_id: number | null;
  patient_view: boolean;
}

export interface UpdateNoteRequest {
  content: string;
  patient_view: boolean;
}
