export interface RegionalAverages {
  city: number | null;
  state: number | null;
  country: number | null;
}

export interface GenderAverages {
  male: number | null;
  female: number | null;
}

export interface PatientDemographics {
  age: number;
  age_group: string;
  gender: string;
  city: string;
  state: string;
  country: string;
}

export interface ComparativeStatistics {
  // Score do próprio paciente
  patient_avg_score: number;

  // Comparações gerais
  global_avg_score: number | null;
  age_group_avg_score: number | null;

  // Comparações regionais
  regional_avg: RegionalAverages;

  // Comparações por gênero
  gender_avg: GenderAverages;

  // Posição do paciente
  patient_percentile: number | null;

  // Informações demográficas do paciente
  demographics: PatientDemographics;

  // Contadores para contexto
  total_patients_in_system: number;
  total_patients_in_age_group: number;
  total_patients_sharing_data: number;
}
