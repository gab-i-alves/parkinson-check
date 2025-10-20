export interface PatientStatistics {
  total_tests: number;
  total_spiral_tests: number;
  total_voice_tests: number;
  avg_spiral_score: number | null;
  avg_voice_score: number | null;
  last_test_date: string | null; // ISO datetime string
  days_since_last_test: number | null;
  first_test_date: string | null; // ISO datetime string
  trend: 'improving' | 'stable' | 'worsening';
  trend_percentage: number;
  best_spiral_score: number | null;
  worst_spiral_score: number | null;
  best_voice_score: number | null;
  worst_voice_score: number | null;
  healthy_classification_count: number;
  parkinson_classification_count: number;
  avg_test_interval_days: number | null;
}
