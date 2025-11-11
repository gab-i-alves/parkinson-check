import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TestDetailService } from '../../../services/test-detail.service';
import { NoteService } from '../../../services/note.service';
import {
  TestDetail,
  SpiralTestDetail,
  VoiceTestDetail,
} from '../../../../../core/models/test-detail.model';
import { Note } from '../../../../../core/models/note.model';
import {
  NoteCategory,
  NoteCategoryLabels,
  NoteCategoryColors,
} from '../../../../../core/enums/note-category.enum';
import { ToastService } from '../../../../../shared/services/toast.service';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { getTestTypeLabel, getSpiralMethodLabel, getClassificationLabel } from '../../../shared/utils/display-helpers';

@Component({
  selector: 'app-patient-test-detail',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './patient-test-detail.component.html',
})
export class PatientTestDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private testDetailService = inject(TestDetailService);
  private noteService = inject(NoteService);
  private toastService = inject(ToastService);

  readonly testId = signal<number | null>(null);
  readonly testDetail = signal<TestDetail | null>(null);
  readonly notes = signal<Note[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

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

  // Enum e labels para o template
  readonly NoteCategory = NoteCategory;
  readonly NoteCategoryLabels = NoteCategoryLabels;
  readonly NoteCategoryColors = NoteCategoryColors;
  readonly getTestTypeLabel = getTestTypeLabel;
  readonly getSpiralMethodLabel = getSpiralMethodLabel;
  readonly getClassificationLabel = getClassificationLabel;

  ngOnInit(): void {
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
    this.testDetailService.getMyTestDetail(testId).subscribe({
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
      // Carregar imagem da espiral (paciente usa endpoint específico)
      this.testDetailService.getMySpiralImage(testId).subscribe({
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
      // Carregar áudio de voz (paciente usa endpoint específico)
      this.testDetailService.getMyVoiceAudio(testId).subscribe({
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

  isSpiralTest(test: TestDetail): test is SpiralTestDetail {
    // Fix: Backend envia enum como número (1=SPIRAL, 2=VOICE) ao invés de string
    return test.test_type === 'SPIRAL_TEST' || (test.test_type as any) === 1;
  }

  isVoiceTest(test: TestDetail): test is VoiceTestDetail {
    // Fix: Backend envia enum como número (1=SPIRAL, 2=VOICE) ao invés de string
    return test.test_type === 'VOICE_TEST' || (test.test_type as any) === 2;
  }

  isNoteEdited(note: Note): boolean {
    return new Date(note.updated_at).getTime() > new Date(note.created_at).getTime();
  }

  goBack(): void {
    this.router.navigate(['/dashboard/results']);
  }

  downloadMedia(): void {
    const id = this.testId();
    if (!id) return;

    const test = this.testDetail();
    if (!test) return;

    if (this.isSpiralTest(test)) {
      this.testDetailService.downloadMySpiralImage(id);
      this.toastService.success('Download da imagem iniciado!');
    } else if (this.isVoiceTest(test)) {
      this.testDetailService.downloadMyVoiceAudio(id);
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
}
