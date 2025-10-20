import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Note,
  CreateNoteRequest,
  UpdateNoteRequest,
} from '../../../core/models/note.model';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Busca todas as notas de um teste específico.
   * Médicos veem todas as notas (de todos os médicos).
   * Pacientes veem apenas notas com patient_view=true.
   */
  getNotes(testId: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl}/notes/${testId}`, {
      withCredentials: true,
    });
  }

  /**
   * Cria uma nova nota para um teste.
   * Apenas médicos podem criar notas.
   */
  createNote(note: CreateNoteRequest): Observable<Note> {
    return this.http.post<Note>(`${this.apiUrl}/notes`, note, {
      withCredentials: true,
    });
  }

  /**
   * Atualiza uma nota existente.
   * Apenas o médico criador pode editar.
   */
  updateNote(noteId: number, note: UpdateNoteRequest): Observable<Note> {
    return this.http.put<Note>(`${this.apiUrl}/notes/${noteId}`, note, {
      withCredentials: true,
    });
  }

  /**
   * Deleta uma nota.
   * Apenas o médico criador pode deletar.
   * Deleta em cascade as notas filhas.
   */
  deleteNote(noteId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/notes/${noteId}`, {
      withCredentials: true,
    });
  }
}
