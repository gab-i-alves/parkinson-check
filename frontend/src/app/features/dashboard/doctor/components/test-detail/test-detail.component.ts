import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TestDetailService } from '../../../services/test-detail.service';
import { NoteService } from '../../../services/note.service';
import {
  TestDetail,
  SpiralTestDetail,
  VoiceTestDetail,
} from '../../../../../core/models/test-detail.model';
import {
  Note,
  CreateNoteRequest,
  UpdateNoteRequest,
} from '../../../../../core/models/note.model';
import {
  NoteCategory,
  NoteCategoryLabels,
  NoteCategoryColors,
} from '../../../../../core/enums/note-category.enum';
import { UserService } from '../../../../../core/services/user.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { getTestTypeLabel, getSpiralMethodLabel, getClassificationLabel } from '../../../shared/utils/display-helpers';

@Component({
  selector: 'app-test-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmationModalComponent],
  templateUrl: './test-detail.component.html',
})
export class TestDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private testDetailService = inject(TestDetailService);
  private noteService = inject(NoteService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  readonly testId = signal<number | null>(null);
  readonly testDetail = signal<TestDetail | null>(null);
  readonly notes = signal<Note[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly currentUserId = signal<number | null>(null);

  // Signals para mídia
  readonly mediaUrl = signal<string | null>(null);
  readonly isLoadingMedia = signal<boolean>(false);
  readonly mediaError = signal<string | null>(null);

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

  readonly showDeleteNoteModal = signal<boolean>(false);
  readonly noteToDelete = signal<number | null>(null);

  noteForm!: FormGroup;
  editForm!: FormGroup;

  // Enum e labels para o template
  readonly NoteCategory = NoteCategory;
  readonly NoteCategoryLabels = NoteCategoryLabels;
  readonly NoteCategoryColors = NoteCategoryColors;
  readonly categories = Object.values(NoteCategory);
  readonly getTestTypeLabel = getTestTypeLabel;
  readonly getSpiralMethodLabel = getSpiralMethodLabel;
  readonly getClassificationLabel = getClassificationLabel;

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
        // Carregar mídia baseado no tipo de teste
        this.loadMedia(testId, test);
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

  loadMedia(testId: number, test: TestDetail): void {
    this.isLoadingMedia.set(true);
    this.mediaError.set(null);

    if (this.isSpiralTest(test)) {
      // Carregar imagem da espiral
      this.testDetailService.getSpiralImage(testId).subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          this.mediaUrl.set(url);
          this.isLoadingMedia.set(false);
        },
        error: (err) => {
          console.error('Erro ao carregar imagem:', err);
          this.mediaError.set('Imagem não disponível');
          this.isLoadingMedia.set(false);
        },
      });
    } else if (this.isVoiceTest(test)) {
      // Carregar áudio de voz
      this.testDetailService.getVoiceAudio(testId).subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          this.mediaUrl.set(url);
          this.isLoadingMedia.set(false);
        },
        error: (err) => {
          console.error('Erro ao carregar áudio:', err);
          this.mediaError.set('Áudio não disponível');
          this.isLoadingMedia.set(false);
        },
      });
    }
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
      this.notificationService.warning('Por favor, preencha todos os campos obrigatórios.');
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
        this.notificationService.success('Anotação criada com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao criar nota:', err);
        this.notificationService.error('Erro ao criar anotação. Tente novamente.');
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
      this.notificationService.warning('Por favor, preencha todos os campos obrigatórios.');
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
        this.notificationService.success('Anotação atualizada com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao atualizar nota:', err);
        this.notificationService.error('Erro ao atualizar anotação. Tente novamente.');
      },
    });
  }

  deleteNote(noteId: number): void {
    this.noteToDelete.set(noteId);
    this.showDeleteNoteModal.set(true);
  }

  confirmDeleteNote(): void {
    const noteId = this.noteToDelete();
    if (noteId === null) {
      return;
    }

    this.noteService.deleteNote(noteId).subscribe({
      next: () => {
        const filteredNotes = this.notes().filter((note) => note.id !== noteId);
        this.notes.set(filteredNotes);
        this.notificationService.success('Anotação deletada com sucesso!');
        this.showDeleteNoteModal.set(false);
        this.noteToDelete.set(null);
      },
      error: (err) => {
        console.error('Erro ao deletar nota:', err);
        this.notificationService.error('Erro ao deletar anotação. Tente novamente.');
        this.showDeleteNoteModal.set(false);
        this.noteToDelete.set(null);
      },
    });
  }

  cancelDeleteNote(): void {
    this.showDeleteNoteModal.set(false);
    this.noteToDelete.set(null);
  }

  isSpiralTest(test: TestDetail): test is SpiralTestDetail {
    // Fix: Backend envia enum como número (1=SPIRAL, 2=VOICE) ao invés de string
    return test.test_type === 'SPIRAL_TEST' || (test.test_type as any) === 1;
  }

  isVoiceTest(test: TestDetail): test is VoiceTestDetail {
    // Fix: Backend envia enum como número (1=SPIRAL, 2=VOICE) ao invés de string
    return test.test_type === 'VOICE_TEST' || (test.test_type as any) === 2;
  }

  isOwnNote(note: Note): boolean {
    return note.doctor_id === this.currentUserId();
  }

  isNoteEdited(note: Note): boolean {
    // Verifica se a nota foi editada comparando timestamps
    return new Date(note.updated_at).getTime() > new Date(note.created_at).getTime();
  }

  goBack(): void {
    this.router.navigate(['/dashboard/doctor/patients']);
  }

  downloadMedia(): void {
    const id = this.testId();
    if (!id) return;

    const test = this.testDetail();
    if (!test) return;

    if (this.isSpiralTest(test)) {
      this.testDetailService.downloadSpiralImage(id);
      this.notificationService.success('Download da imagem iniciado!');
    } else if (this.isVoiceTest(test)) {
      this.testDetailService.downloadVoiceAudio(id);
      this.notificationService.success('Download do áudio iniciado!');
    }
  }

  openMediaInNewTab(): void {
    const url = this.mediaUrl();
    if (url) {
      window.open(url, '_blank');
    }
  }

  ngOnDestroy(): void {
    // Limpar URL de mídia para evitar memory leak
    const url = this.mediaUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
}
