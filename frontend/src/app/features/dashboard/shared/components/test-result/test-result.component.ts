import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  ClinicalSpiralTestResult,
  ClinicalVoiceTestResult,
} from '../../../../../core/models/clinical-test-result.model';

@Component({
  selector: 'app-test-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-result.component.html',
})
export class TestResultComponent implements OnInit {
  readonly result = signal<
    ClinicalSpiralTestResult | ClinicalVoiceTestResult | null
  >(null);
  readonly testType = signal<'spiral' | 'voice' | null>(null);
  readonly isPracticeMode = signal<boolean>(false);

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Obtém dados passados via navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;

    if (state && state.result) {
      this.result.set(state.result);
      this.testType.set(state.testType);
      this.isPracticeMode.set(state.isPracticeMode || false);
    } else {
      // Se não houver dados, redireciona para dashboard
      this.router.navigate(['/dashboard']);
    }
  }

  isSpiralResult(
    result: ClinicalSpiralTestResult | ClinicalVoiceTestResult
  ): result is ClinicalSpiralTestResult {
    return 'majority_decision' in result;
  }

  getModelKeys(result: ClinicalSpiralTestResult): string[] {
    return Object.keys(result.model_results);
  }

  getClassification(): string {
    const res = this.result();
    if (!res) return '';

    if (this.isSpiralResult(res)) {
      return res.majority_decision;
    } else {
      // Para voz, classificar baseado no score
      return res.score >= 0.5 ? 'PARKINSON' : 'HEALTHY';
    }
  }

  getClassificationColor(): string {
    const classification = this.getClassification();
    return classification === 'PARKINSON' ? 'text-red-600' : 'text-green-600';
  }

  getClassificationBgColor(): string {
    const classification = this.getClassification();
    return classification === 'PARKINSON' ? 'bg-red-50' : 'bg-green-50';
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

  viewPatientHistory(): void {
    const res = this.result();
    if (res && res.patient_id) {
      // Navegar para perfil completo do paciente
      this.router.navigate(['/dashboard/doctor/patient', res.patient_id]);
    }
  }

  viewMyHistory(): void {
    this.router.navigate(['/dashboard']);
  }

  backToTests(): void {
    this.router.navigate(['/dashboard/tests']);
  }

  backToDashboard(): void {
    if (this.isPracticeMode()) {
      this.router.navigate(['/dashboard/tests']);
    } else {
      this.router.navigate(['/dashboard/doctor']);
    }
  }
}
