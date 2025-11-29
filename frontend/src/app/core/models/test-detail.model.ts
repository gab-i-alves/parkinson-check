export type TestType = 'SPIRAL_TEST' | 'VOICE_TEST';
export type SpiralMethod = 'PAPER' | 'WEBCAM';
export type Classification = 'HEALTHY' | 'PARKINSON';

export interface PatientInfo {
  id: number;
  name: string;
}

export interface BaseTestDetail {
  id: number;
  test_type: TestType;
  execution_date: string;
  score: number;
  patient_id: number;
  patient: PatientInfo;
  classification: Classification;
}

export interface ModelPrediction {
  prediction: string;
  probabilities?: Record<string, number>;
}

/**
 * Características geométricas extraídas da imagem da espiral pelo modelo de ML.
 * Estas features são usadas internamente pelos classificadores para análise.
 */
export interface SpiralExtractedFeatures {
  /** Área do contorno principal da espiral (pixels²) */
  area: number;
  /** Perímetro do contorno principal (pixels) */
  perimeter: number;
  /** Circularidade: 4π×área/perímetro² (0-1, 1=círculo perfeito) */
  circularity: number;
  /** Razão de aspecto: largura/altura do bounding box */
  aspect_ratio: number;
  /** Entropia da imagem (medida de complexidade/irregularidade) */
  entropy: number;
  /** Espessura média do traçado (pixels) */
  mean_thickness: number;
  /** Desvio padrão da espessura do traçado (pixels) */
  std_thickness: number;
}

export interface VoiceTestDetail extends BaseTestDetail {
  test_type: 'VOICE_TEST';
  record_duration: number;
  raw_parkinson_probability?: number;
}

export interface SpiralTestDetail extends BaseTestDetail {
  test_type: 'SPIRAL_TEST';
  draw_duration: number;
  method: SpiralMethod;
  model_predictions?: Record<string, ModelPrediction>;
  avg_parkinson_probability?: number;
  majority_vote?: string;
  healthy_votes?: number;
  parkinson_votes?: number;
  // Características extraídas da imagem
  feature_area?: number;
  feature_perimeter?: number;
  feature_circularity?: number;
  feature_aspect_ratio?: number;
  feature_entropy?: number;
  feature_mean_thickness?: number;
  feature_std_thickness?: number;
}

export type TestDetail = VoiceTestDetail | SpiralTestDetail;
