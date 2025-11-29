/**
 * Características geométricas extraídas da imagem da espiral pelo modelo de ML.
 */
export interface SpiralExtractedFeatures {
  area: number;
  perimeter: number;
  circularity: number;
  aspect_ratio: number;
  entropy: number;
  mean_thickness: number;
  std_thickness: number;
}

export interface SpiralTestResponse {
  majority_decision: string;
  vote_count: {
    Healthy: number;
    Parkinson: number;
  };
  model_results: {
    [modelName: string]: {
      prediction: string;
      probabilities: { [className: string]: number } | null;
    };
  };
  extracted_features?: SpiralExtractedFeatures;
}
