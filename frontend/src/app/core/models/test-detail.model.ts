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
}

export type TestDetail = VoiceTestDetail | SpiralTestDetail;
