// Core Models Barrel File
export * from './binding-request.model';
export * from './clinical-test-result.model';
export * from './doctor.model';
export * from './login.model';
export * from './note.model';
export * from './notification.model';
export * from './patient-full-profile.model';
export * from './patient-statistics.model';
export * from './register.model';
export * from './reset-password-request.model';
export * from './spiral-test-response.model';
export * from './user.model';

// Export with explicit naming to avoid conflicts
export type {
  TimelineTestItem,
  PatientTimeline,
  TestType as TimelineTestType,
  TestStatus as TimelineTestStatus,
  SpiralMethod as TimelineSpiralMethod
} from './patient-timeline.model';

export type {
  Patient,
  PaginatedPatients,
  PatientFilters,
  PatientStatus,
  TestType as PatientTestType
} from './patient.model';

export type {
  TestDetail,
  BaseTestDetail,
  VoiceTestDetail,
  SpiralTestDetail,
  PatientInfo,
  TestType as DetailTestType,
  TestStatus as DetailTestStatus,
  SpiralMethod as DetailSpiralMethod,
  Classification
} from './test-detail.model';
