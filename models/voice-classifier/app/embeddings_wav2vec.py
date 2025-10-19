import torch
import librosa
import numpy as np
import pandas as pd
from transformers import Wav2Vec2Processor, Wav2Vec2Model
import os

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base-960h")
model = Wav2Vec2Model.from_pretrained("facebook/wav2vec2-base-960h").to(DEVICE)


def extract_wav2vec_embedding(file_path, sr=16000, duration=5.0):
    y, _ = librosa.load(file_path, sr=sr, mono=True)
    max_len = int(sr * duration)
    if len(y) > max_len:
        y = y[:max_len]
    elif len(y) < max_len:
        y = np.pad(y, (0, max_len - len(y)))

    inputs = processor(y, sampling_rate=sr, return_tensors="pt", padding=True)
    with torch.no_grad():
        outputs = model(inputs.input_values.to(DEVICE))
        emb = outputs.last_hidden_state.mean(dim=1).cpu().numpy().flatten()
    return emb


def build_embeddings(base_path="data/raw/data_italian", sr=16000, duration=5.0):
    rows, labels, patients, groups, files = [], [], [], [], []

    for root, dirs, files_in_dir in os.walk(base_path):
        for file in files_in_dir:
            if not file.lower().endswith(".wav"):
                continue

            path = os.path.join(root, file)

            if "Healthy Control" in path:
                label = "HC"
            elif "Parkinson" in path:
                label = "PD"
            else:
                continue

            patient = os.path.basename(os.path.dirname(path))

            try:
                emb = extract_wav2vec_embedding(path, sr, duration)
                rows.append(emb)
                labels.append(label)
                patients.append(patient)
                groups.append(patient)
                files.append(file)
            except Exception as e:
                print(f"[WARN] erro em {file}: {e}")
                continue

    X = np.vstack(rows)
    df = pd.DataFrame(X)
    df["class"] = labels
    df["patient"] = patients
    df["group"] = groups
    df["file"] = files
    return df
