export interface PatientsByStatus {
  stable: number;
  attention: number;
  critical: number;
}

export interface DashboardOverview {
  total_patients: number;
  patients_by_status: PatientsByStatus;
  total_tests: number;
  total_tests_this_month: number;
  avg_score_all_patients: number | null;
}

export interface PatientRanking {
  patient_id: number;
  patient_name: string;
  avg_score: number;
  total_tests: number;
  last_test_date: string | null;
}

export interface Rankings {
  top_spiral_scores: PatientRanking[];
  top_voice_scores: PatientRanking[];
  top_overall_scores: PatientRanking[];
}

export interface TimeSeriesDataPoint {
  date: string;
  avg_score: number;
  test_count: number;
}

export interface ScoreEvolution {
  time_series: TimeSeriesDataPoint[];
  overall_trend: 'improving' | 'stable' | 'worsening';
  trend_percentage: number | null;
}

export interface AgeGroupData {
  age_range: string;
  avg_score: number;
  patient_count: number;
  avg_spiral_score: number | null;
  avg_voice_score: number | null;
}

export interface AgeGroupAnalysis {
  age_groups: AgeGroupData[];
}

export interface TestTypeData {
  count: number;
  percentage: number;
  avg_score: number;
}

export interface TestDistribution {
  total_tests: number;
  spiral_tests: TestTypeData;
  voice_tests: TestTypeData;
  by_classification: { [key: string]: number };
}

export interface DashboardFilters {
  period: '7d' | '30d' | '3m' | '6m' | '1y';
  testType: 'all' | 'spiral' | 'voice';
  status: 'all' | 'stable' | 'attention' | 'critical';
}

export interface DashboardKPIs {
  totalPatients: number;
  totalTestsThisMonth: number;
  avgScoreGeneral: number | null;
  patientsNeedingAttention: number;
  adherenceRate: number;
  newPatientsThisMonth: number;
  scoreTrend: 'up' | 'down' | 'stable';
  scoreTrendPercentage: number;
}

export interface PatientNeedingAttention {
  patient_id: number;
  patient_name: string;
  last_test_date: string | null;
  last_score: number;
  avg_score: number;
  status: 'attention' | 'critical';
  trend: 'improving' | 'stable' | 'worsening';
  total_tests: number;
}

export interface TestFrequencyDataPoint {
  period: string;
  spiral_count: number;
  voice_count: number;
  total_count: number;
}
