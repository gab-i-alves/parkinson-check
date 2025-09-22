import os
import joblib
from .embeddings_wav2vec import extract_wav2vec_embedding

model = joblib.load("artifacts/svm_rbf_wav2vec.joblib")
encoder = joblib.load("artifacts/label_encoder.joblib")

def predict_audio(wav_path, sr=16000, duration=5.0):
    """
    Realiza a predição em um arquivo de áudio.
    """
    emb = extract_wav2vec_embedding(wav_path, sr=sr, duration=duration).reshape(1, -1)
    
    pred = model.predict(emb)[0]
    
    try:
        proba = model.predict_proba(emb)[0][1]
    except AttributeError:
        proba = None

    label = encoder.inverse_transform([pred])[0]
    
    return {"file": os.path.basename(wav_path), "label": label, "proba_PD": proba}