import { SpiralExtractedFeatures } from './spiral-test-response.model';

export interface ClinicalSpiralTestResult {
  test_id?: number;
  patient_id?: number;
  doctor_id?: number;
  majority_decision: string;
  vote_count: {
    Healthy: number;
    Parkinson: number;
  };
  model_results: {
    [key: string]: {
      prediction: string;
      probabilities?: { [key: string]: number };
    };
  };
  extracted_features?: SpiralExtractedFeatures;
  score: number;
  execution_date?: string;
}

export interface ClinicalVoiceTestResult {
  test_id?: number;
  patient_id?: number;
  doctor_id?: number;
  score: number;
  analysis: string;
  execution_date?: string;
}
