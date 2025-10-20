export type TestType = 'SPIRAL_TEST' | 'VOICE_TEST';
export type TestStatus = 'DONE' | 'PENDING' | 'FAILED';
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
  status: TestStatus;
  score: number;
  patient_id: number;
  patient: PatientInfo;
  classification: Classification;
}

export interface VoiceTestDetail extends BaseTestDetail {
  test_type: 'VOICE_TEST';
  record_duration: number;
}

export interface SpiralTestDetail extends BaseTestDetail {
  test_type: 'SPIRAL_TEST';
  draw_duration: number;
  method: SpiralMethod;
}

export type TestDetail = VoiceTestDetail | SpiralTestDetail;
