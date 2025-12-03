import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  ClinicalSpiralTestResult,
  ClinicalVoiceTestResult,
} from '../../../../../core/models/clinical-test-result.model';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-clinical-test-result',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './clinical-test-result.component.html',
})
export class ClinicalTestResultComponent implements OnInit {
  readonly result = signal<
    ClinicalSpiralTestResult | ClinicalVoiceTestResult | null
  >(null);
  readonly testType = signal<'spiral' | 'voice' | null>(null);

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Obtém dados passados via navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;

    if (state && state.result) {
      this.result.set(state.result);
      this.testType.set(state.testType);
    } else {
      // Se não houver dados, redireciona para dashboard
      this.router.navigate(['/dashboard/doctor']);
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
      // Para voz, classificar baseado no score (threshold 0.7 = backend)
      return res.score >= 0.7 ? 'HEALTHY' : 'PARKINSON';
    }
  }

  getClassificationVariant(): 'success' | 'error' {
    const classification = this.getClassification();
    return classification === 'PARKINSON' ? 'error' : 'success';
  }

  getClassificationLabel(): string {
    const classification = this.getClassification();
    return classification === 'HEALTHY' ? 'Saudável' : 'Parkinson';
  }

  getPredictionVariant(prediction: string): 'success' | 'error' {
    return prediction === 'PARKINSON' ? 'error' : 'success';
  }

  getPredictionLabel(prediction: string): string {
    if (prediction === 'HEALTHY') return 'Saudável';
    if (prediction === 'PARKINSON') return 'Parkinson';
    return prediction; // fallback para valores inesperados
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
    if (res) {
      // Navegar para perfil completo do paciente
      this.router.navigate(['/dashboard/doctor/patient', res.patient_id]);
    }
  }

  backToDashboard(): void {
    this.router.navigate(['/dashboard/doctor']);
  }
}
