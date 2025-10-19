# models/voice-classifier/app/predictor.py

import joblib
import os
from .embeddings_wav2vec import extract_wav2vec_embedding as extract_embeddings

artifacts_path = os.path.join(os.path.dirname(__file__), "..", "artifacts")
model = joblib.load(os.path.join(artifacts_path, "svm_rbf_wav2vec.joblib"))
label_encoder = joblib.load(os.path.join(artifacts_path, "label_encoder.joblib"))


def predict_audio(file_path: str):
    """
    Prevê a probabilidade de Parkinson a partir de um arquivo de áudio
    e retorna o resultado no formato esperado pelo backend.
    """
    try:
        features = extract_embeddings(file_path)
        features_2d = features.reshape(1, -1)

        prediction_encoded = model.predict(features_2d)
        prediction_label = label_encoder.inverse_transform(prediction_encoded)[0]

        probability_pd = model.predict_proba(features_2d)[0][1]

        analysis_text = (
            f"A análise vocal indica uma probabilidade de {probability_pd:.2%} "
            f"de apresentar características associadas à Doença de Parkinson. "
            f"O modelo classificou a amostra como '{prediction_label}'."
        )

        return {"score": float(probability_pd), "analysis": analysis_text}

    except Exception as e:
        print(f"Erro durante a predição: {e}")
        raise e
