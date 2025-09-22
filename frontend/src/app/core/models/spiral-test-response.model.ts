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
}
