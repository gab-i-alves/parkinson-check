import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  ClinicalSpiralTestResult,
  ClinicalVoiceTestResult,
} from '../../../../../core/models/clinical-test-result.model';
import { SpiralExtractedFeatures } from '../../../../../core/models/spiral-test-response.model';
import { TooltipDirective } from '../../../../../shared/directives/tooltip.directive';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-test-result',
  standalone: true,
  imports: [CommonModule, TooltipDirective, BadgeComponent],
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
      // Para voz, classificar baseado no score (threshold 0.7 = backend)
      return res.score >= 0.7 ? 'HEALTHY' : 'PARKINSON';
    }
  }

  getClassificationColor(): string {
    const classification = this.getClassification();
    return classification === 'PARKINSON' ? 'text-pink-700' : 'text-green-700';
  }

  getClassificationBgColor(): string {
    const classification = this.getClassification();
    return classification === 'PARKINSON' ? 'bg-pink-50 border-pink-200' : 'bg-green-50 border-green-200';
  }

  getClassificationBadgeVariant(): 'success' | 'error' | 'neutral' {
    const classification = this.getClassification();
    if (classification === 'HEALTHY') return 'success';
    if (classification === 'PARKINSON') return 'error';
    return 'neutral';
  }

  getClassificationLabel(): string {
    const classification = this.getClassification();
    return classification === 'HEALTHY' ? 'Saudável' : 'Parkinson';
  }

  formatProbability(value: number): string {
    return (value * 100).toFixed(1) + '%';
  }

  getPredictionBadgeVariant(prediction: string): 'success' | 'error' | 'neutral' {
    if (prediction === 'HEALTHY') return 'success';
    if (prediction === 'PARKINSON') return 'error';
    return 'neutral';
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

  goBack(): void {
    if (this.isPracticeMode()) {
      this.router.navigate(['/dashboard/tests']);
    } else {
      this.router.navigate(['/dashboard/doctor']);
    }
  }

  // Métodos para features extraídas
  hasExtractedFeatures(result: ClinicalSpiralTestResult): boolean {
    return !!result.extracted_features;
  }

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

  formatFeatureValue(key: string, value: number): string {
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

  getFeatureKeys(features: SpiralExtractedFeatures): string[] {
    return ['area', 'perimeter', 'circularity', 'aspect_ratio', 'entropy', 'mean_thickness', 'std_thickness'];
  }

  getFeatureValue(features: SpiralExtractedFeatures, key: string): number {
    return features[key as keyof SpiralExtractedFeatures];
  }

  calculateAverageProbability(result: ClinicalSpiralTestResult): string {
    const modelKeys = Object.keys(result.model_results);
    let totalProbability = 0;
    let count = 0;

    for (const key of modelKeys) {
      const probs = result.model_results[key].probabilities;
      if (probs && probs['Parkinson'] !== undefined) {
        totalProbability += probs['Parkinson'];
        count++;
      }
    }

    if (count === 0) return '0.0';
    return ((totalProbability / count) * 100).toFixed(1);
  }
}
