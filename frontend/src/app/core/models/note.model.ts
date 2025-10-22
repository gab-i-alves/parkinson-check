import { NoteCategory } from '../enums/note-category.enum';

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
  category: NoteCategory;
  doctor_id: number;
  doctor: DoctorInfo;
  created_at: string;
  updated_at: string;
  linked_notes?: Note[];
  parent_note?: Note;
}

export interface CreateNoteRequest {
  content: string;
  test_id: number;
  parent_note_id: number | null;
  patient_view: boolean;
  category: NoteCategory;
}

export interface UpdateNoteRequest {
  content: string;
  patient_view: boolean;
  category: NoteCategory;
}
