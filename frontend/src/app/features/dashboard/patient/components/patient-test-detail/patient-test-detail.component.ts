import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TestDetailService } from '../../services/test-detail.service';
import { NoteService } from '../../services/note.service';
import {
  TestDetail,
  SpiralTestDetail,
  VoiceTestDetail,
} from '../../../../core/models/test-detail.model';
import { Note } from '../../../../core/models/note.model';
import {
  NoteCategory,
  NoteCategoryLabels,
  NoteCategoryColors,
} from '../../../../core/enums/note-category.enum';

@Component({
  selector: 'app-patient-test-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-test-detail.component.html',
})
export class PatientTestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private testDetailService = inject(TestDetailService);
  private noteService = inject(NoteService);

  readonly testId = signal<number | null>(null);
  readonly testDetail = signal<TestDetail | null>(null);
  readonly notes = signal<Note[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

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
    // Fix: Backend envia enum como número (1=SPIRAL, 2=VOICE) ao invés de string
    return type === 'SPIRAL_TEST' || (type as any) === 1 ? 'Teste de Espiral' : 'Teste de Voz';
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
    this.router.navigate(['/dashboard']);
  }
}
