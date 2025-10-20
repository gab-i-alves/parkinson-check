export type TestType = 'SPIRAL_TEST' | 'VOICE_TEST';
export type TestStatus = 'DONE' | 'PENDING' | 'FAILED';
export type SpiralMethod = 'PAPER' | 'WEBCAM';

export interface TimelineTestItem {
  test_id: number;
  test_type: TestType;
  execution_date: string; // ISO datetime string
  score: number;
  classification: 'HEALTHY' | 'PARKINSON';
  status: TestStatus;
  // Spiral-specific fields
  draw_duration?: number;
  method?: SpiralMethod;
  majority_decision?: string;
  // Voice-specific fields
  record_duration?: number;
  analysis?: string;
}

export interface PatientTimeline {
  tests: TimelineTestItem[];
  total_count: number;
}
