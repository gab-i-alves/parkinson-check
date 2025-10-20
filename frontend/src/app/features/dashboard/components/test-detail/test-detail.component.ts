import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TestDetailService } from '../../services/test-detail.service';
import { NoteService } from '../../services/note.service';
import {
  TestDetail,
  SpiralTestDetail,
  VoiceTestDetail,
} from '../../../../core/models/test-detail.model';
import {
  Note,
  CreateNoteRequest,
  UpdateNoteRequest,
} from '../../../../core/models/note.model';
import {
  NoteCategory,
  NoteCategoryLabels,
  NoteCategoryColors,
} from '../../../../core/enums/note-category.enum';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-test-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './test-detail.component.html',
})
export class TestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private testDetailService = inject(TestDetailService);
  private noteService = inject(NoteService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  readonly testId = signal<number | null>(null);
  readonly testDetail = signal<TestDetail | null>(null);
  readonly notes = signal<Note[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly currentUserId = signal<number | null>(null);

  readonly spiralTestDetail = computed<SpiralTestDetail | null>(() => {
    const td = this.testDetail();
    if (td && this.isSpiralTest(td)) {
      return td;
    }
    return null;
  });

  readonly voiceTestDetail = computed<VoiceTestDetail | null>(() => {
    const td = this.testDetail();
    if (td && this.isVoiceTest(td)) {
      return td;
    }
    return null;
  });

  readonly isAddingNote = signal<boolean>(false);
  readonly editingNoteId = signal<number | null>(null);

  noteForm!: FormGroup;
  editForm!: FormGroup;

  // Enum e labels para o template
  readonly NoteCategory = NoteCategory;
  readonly NoteCategoryLabels = NoteCategoryLabels;
  readonly NoteCategoryColors = NoteCategoryColors;
  readonly categories = Object.values(NoteCategory);

  ngOnInit(): void {
    // Inicializar formulários
    this.noteForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]],
      patient_view: [false],
      category: [NoteCategory.OBSERVATION, [Validators.required]],
    });

    this.editForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]],
      patient_view: [false],
      category: [NoteCategory.OBSERVATION, [Validators.required]],
    });

    // Pegar ID do usuário atual
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.currentUserId.set(currentUser.id);
    }

    // Carregar dados do teste
    const id = this.route.snapshot.paramMap.get('testId');
    if (id) {
      this.testId.set(Number(id));
      this.loadTestData(Number(id));
      this.loadNotes(Number(id));
    } else {
      this.errorMessage.set('ID do teste não fornecido');
      this.isLoading.set(false);
    }
  }

  loadTestData(testId: number): void {
    this.testDetailService.getTestDetail(testId).subscribe({
      next: (test) => {
        this.testDetail.set(test);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes do teste:', err);
        this.errorMessage.set(
          'Erro ao carregar detalhes do teste. Verifique suas permissões.'
        );
        this.isLoading.set(false);
      },
    });
  }

  loadNotes(testId: number): void {
    this.noteService.getNotes(testId).subscribe({
      next: (notes) => {
        this.notes.set(notes);
      },
      error: (err) => {
        console.error('Erro ao carregar notas:', err);
      },
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getTestTypeLabel(type: string): string {
    return type === 'SPIRAL_TEST' ? 'Teste de Espiral' : 'Teste de Voz';
  }

  getClassificationColor(classification: string): string {
    return classification === 'HEALTHY'
      ? 'text-green-600 bg-green-50'
      : 'text-red-600 bg-red-50';
  }

  toggleAddNote(): void {
    this.isAddingNote.set(!this.isAddingNote());
    if (!this.isAddingNote()) {
      this.noteForm.reset({ patient_view: false, category: NoteCategory.OBSERVATION });
    }
  }

  addNote(): void {
    if (this.noteForm.invalid || !this.testId()) {
      return;
    }

    const request: CreateNoteRequest = {
      content: this.noteForm.value.content,
      test_id: this.testId()!,
      parent_note_id: null,
      patient_view: this.noteForm.value.patient_view,
      category: this.noteForm.value.category,
    };

    this.noteService.createNote(request).subscribe({
      next: (note) => {
        this.notes.set([note, ...this.notes()]);
        this.noteForm.reset({ patient_view: false, category: NoteCategory.OBSERVATION });
        this.isAddingNote.set(false);
      },
      error: (err) => {
        console.error('Erro ao criar nota:', err);
        alert('Erro ao criar nota. Tente novamente.');
      },
    });
  }

  startEdit(note: Note): void {
    this.editingNoteId.set(note.id);
    this.editForm.patchValue({
      content: note.content,
      patient_view: note.patient_view,
      category: note.category,
    });
  }

  cancelEdit(): void {
    this.editingNoteId.set(null);
    this.editForm.reset();
  }

  saveEdit(noteId: number): void {
    if (this.editForm.invalid) {
      return;
    }

    const request: UpdateNoteRequest = {
      content: this.editForm.value.content,
      patient_view: this.editForm.value.patient_view,
      category: this.editForm.value.category,
    };

    this.noteService.updateNote(noteId, request).subscribe({
      next: (updatedNote) => {
        const updatedNotes = this.notes().map((note) =>
          note.id === noteId ? updatedNote : note
        );
        this.notes.set(updatedNotes);
        this.editingNoteId.set(null);
        this.editForm.reset();
      },
      error: (err) => {
        console.error('Erro ao atualizar nota:', err);
        alert('Erro ao atualizar nota. Tente novamente.');
      },
    });
  }

  deleteNote(noteId: number): void {
    if (!confirm('Tem certeza que deseja deletar esta nota?')) {
      return;
    }

    this.noteService.deleteNote(noteId).subscribe({
      next: () => {
        const filteredNotes = this.notes().filter((note) => note.id !== noteId);
        this.notes.set(filteredNotes);
      },
      error: (err) => {
        console.error('Erro ao deletar nota:', err);
        alert('Erro ao deletar nota. Tente novamente.');
      },
    });
  }

  isSpiralTest(test: TestDetail): test is SpiralTestDetail {
    return test.test_type === 'SPIRAL_TEST';
  }

  isVoiceTest(test: TestDetail): test is VoiceTestDetail {
    return test.test_type === 'VOICE_TEST';
  }

  isOwnNote(note: Note): boolean {
    return note.doctor_id === this.currentUserId();
  }

  goBack(): void {
    this.router.navigate(['/dashboard/patients']);
  }
}
