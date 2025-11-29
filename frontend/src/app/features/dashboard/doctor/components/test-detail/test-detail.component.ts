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
import { ToastService } from '../../../../../shared/services/toast.service';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { getTestTypeLabel, getSpiralMethodLabel, getClassificationLabel } from '../../../shared/utils/display-helpers';

@Component({
  selector: 'app-test-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmationModalComponent, BadgeComponent],
  templateUrl: './test-detail.component.html',
})
export class TestDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private testDetailService = inject(TestDetailService);
  private noteService = inject(NoteService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
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

  // Reply mode signals
  readonly isReplyingToNote = signal<boolean>(false);
  readonly replyingToNoteId = signal<number | null>(null);

  readonly showDeleteNoteModal = signal<boolean>(false);
  readonly noteToDelete = signal<number | null>(null);

  // Organized threaded notes
  readonly threadedNotes = computed<Note[]>(() => {
    return this.organizeNotesIntoThreads(this.notes());
  });

  noteForm!: FormGroup;
  editForm!: FormGroup;
  replyForm!: FormGroup;

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

    this.replyForm = this.fb.group({
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
      // Close reply form if opening add note form
      this.isReplyingToNote.set(false);
      this.replyingToNoteId.set(null);
    } else {
      this.noteForm.reset({ patient_view: false, category: NoteCategory.OBSERVATION });
    }
  }

  addNote(): void {
    if (this.noteForm.invalid || !this.testId()) {
      this.toastService.warning('Por favor, preencha todos os campos obrigatórios.');
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
        this.toastService.success('Anotação criada com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao criar nota:', err);
        this.toastService.error('Erro ao criar anotação. Tente novamente.');
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
    // Close reply form if opening edit form
    this.isReplyingToNote.set(false);
    this.replyingToNoteId.set(null);
  }

  cancelEdit(): void {
    this.editingNoteId.set(null);
    this.editForm.reset();
  }

  saveEdit(noteId: number): void {
    if (this.editForm.invalid) {
      this.toastService.warning('Por favor, preencha todos os campos obrigatórios.');
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
        this.toastService.success('Anotação atualizada com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao atualizar nota:', err);
        this.toastService.error('Erro ao atualizar anotação. Tente novamente.');
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
        this.toastService.success('Anotação deletada com sucesso!');
        this.showDeleteNoteModal.set(false);
        this.noteToDelete.set(null);
      },
      error: (err) => {
        console.error('Erro ao deletar nota:', err);
        this.toastService.error('Erro ao deletar anotação. Tente novamente.');
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
      this.toastService.success('Download da imagem iniciado!');
    } else if (this.isVoiceTest(test)) {
      this.testDetailService.downloadVoiceAudio(id);
      this.toastService.success('Download do áudio iniciado!');
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

  // ========== THREAD/REPLY FUNCTIONALITY (HU 14 CA2) ==========

  /**
   * Organizes flat notes array into a hierarchical thread structure
   * Parent notes (parent_note_id === null) come first with their replies nested
   * Max depth: 2 levels (parent → reply only, no nested replies)
   * Reply sort order: newest-first
   */
  organizeNotesIntoThreads(notes: Note[]): Note[] {
    const parentNotes = notes.filter(note => note.parent_note_id === null);
    const replyNotes = notes.filter(note => note.parent_note_id !== null);

    // Group replies by parent ID
    const repliesMap = new Map<number, Note[]>();
    replyNotes.forEach(reply => {
      const parentId = reply.parent_note_id!;
      if (!repliesMap.has(parentId)) {
        repliesMap.set(parentId, []);
      }
      repliesMap.get(parentId)!.push(reply);
    });

    // Sort replies newest-first
    repliesMap.forEach(replies => {
      replies.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    });

    // Build result: parent notes sorted newest-first with their replies
    const result: Note[] = [];
    parentNotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    parentNotes.forEach(parent => {
      result.push(parent);
      const replies = repliesMap.get(parent.id) || [];
      result.push(...replies);
    });

    return result;
  }

  getParentNote(noteId: number): Note | null {
    return this.notes().find(n => n.id === noteId) || null;
  }

  getNestingLevel(note: Note): number {
    if (note.parent_note_id === null) return 0;
    const parent = this.getParentNote(note.parent_note_id);
    if (!parent) return 1;
    return 1 + this.getNestingLevel(parent);
  }

  getReplyCount(noteId: number): number {
    return this.notes().filter(n => n.parent_note_id === noteId).length;
  }

  /**
   * Get all replies for a specific parent note, sorted newest-first
   */
  getRepliesFor(noteId: number): Note[] {
    const replies = this.notes().filter(n => n.parent_note_id === noteId);
    return replies.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  startReply(note: Note): void {
    // Prevent replying to replies (max 2 levels: parent → reply only)
    if (note.parent_note_id !== null) {
      this.toastService.warning('Não é possível responder a uma resposta. Responda à nota principal.');
      return;
    }

    this.isReplyingToNote.set(true);
    this.replyingToNoteId.set(note.id);
    this.isAddingNote.set(false);
    this.editingNoteId.set(null);

    // Inherit patient_view from parent note
    this.replyForm.reset({
      patient_view: note.patient_view,
      category: NoteCategory.OBSERVATION
    });

    setTimeout(() => {
      const element = document.getElementById(`note-${note.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }

  cancelReply(): void {
    this.isReplyingToNote.set(false);
    this.replyingToNoteId.set(null);
    this.replyForm.reset();
  }

  submitReply(): void {
    if (this.replyForm.invalid || !this.testId() || !this.replyingToNoteId()) {
      this.toastService.warning('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const request: CreateNoteRequest = {
      content: this.replyForm.value.content,
      test_id: this.testId()!,
      parent_note_id: this.replyingToNoteId(),
      patient_view: this.replyForm.value.patient_view,
      category: this.replyForm.value.category,
    };

    this.noteService.createNote(request).subscribe({
      next: (note) => {
        this.notes.set([note, ...this.notes()]);
        this.replyForm.reset({ patient_view: false, category: NoteCategory.OBSERVATION });
        this.isReplyingToNote.set(false);
        this.replyingToNoteId.set(null);
        this.toastService.success('Resposta criada com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao criar resposta:', err);
        this.toastService.error('Erro ao criar resposta. Tente novamente.');
      },
    });
  }

  isBeingRepliedTo(noteId: number): boolean {
    return this.replyingToNoteId() === noteId;
  }

  isReply(note: Note): boolean {
    return note.parent_note_id !== null;
  }

  // ========== EXTRACTED FEATURES DISPLAY ==========

  hasExtractedFeatures(test: SpiralTestDetail): boolean {
    return test.feature_area != null;
  }

  readonly featureKeys = ['area', 'perimeter', 'circularity', 'aspect_ratio', 'entropy', 'mean_thickness', 'std_thickness'];

  getFeatureLabel(key: string): string {
    const labels: Record<string, string> = {
      area: 'Área do Contorno',
      perimeter: 'Perímetro',
      circularity: 'Circularidade',
      aspect_ratio: 'Razão de Aspecto',
      entropy: 'Entropia',
      mean_thickness: 'Espessura Média',
      std_thickness: 'Desvio Padrão da Espessura',
    };
    return labels[key] || key;
  }

  getFeatureDescription(key: string): string {
    const descriptions: Record<string, string> = {
      area: 'Área total do contorno principal da espiral em pixels²',
      perimeter: 'Comprimento total do contorno em pixels',
      circularity: 'Quão circular é a forma (0-1, onde 1 = círculo perfeito)',
      aspect_ratio: 'Proporção entre largura e altura do desenho',
      entropy: 'Medida de complexidade e irregularidade do traçado',
      mean_thickness: 'Espessura média do traçado em pixels',
      std_thickness: 'Variação na espessura do traçado (irregularidade)',
    };
    return descriptions[key] || '';
  }

  getFeatureUnit(key: string): string {
    const units: Record<string, string> = {
      area: 'px²',
      perimeter: 'px',
      circularity: '',
      aspect_ratio: '',
      entropy: 'bits',
      mean_thickness: 'px',
      std_thickness: 'px',
    };
    return units[key] || '';
  }

  getFeatureValue(test: SpiralTestDetail, key: string): number | null {
    const featureMap: Record<string, number | undefined> = {
      area: test.feature_area,
      perimeter: test.feature_perimeter,
      circularity: test.feature_circularity,
      aspect_ratio: test.feature_aspect_ratio,
      entropy: test.feature_entropy,
      mean_thickness: test.feature_mean_thickness,
      std_thickness: test.feature_std_thickness,
    };
    return featureMap[key] ?? null;
  }

  formatFeatureValue(key: string, value: number | null): string {
    if (value === null) return '-';
    if (key === 'circularity' || key === 'aspect_ratio') {
      return value.toFixed(3);
    } else if (key === 'entropy') {
      return value.toFixed(2);
    } else if (key === 'area') {
      return value.toFixed(0);
    } else {
      return value.toFixed(2);
    }
  }
}
