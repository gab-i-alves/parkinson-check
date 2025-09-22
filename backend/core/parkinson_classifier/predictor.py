import cv2
import numpy as np
import joblib
from .processing import preprocess_image, extract_features
from collections import Counter

def _labels(c):
    if isinstance(c, (int, np.integer)):
        return "Healthy" if c == 0 else "Parkinson"
    s = str(c)
    if s.lower().startswith("heal"):
        return "Healthy"
    if s.lower().startswith("park"):
        return "Parkinson"
    return s

def predict_image(model_path, scaler_path, image_path):
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    img = preprocess_image(image_path)
    feats = extract_features(img)

    if feats is None:
        raise ValueError("Could not extract features from the image.")
    
    X = np.array(feats, dtype=np.float32).reshape(1, -1)
    Xs = scaler.transform(X)
    pred_raw = model.predict(Xs)[0]
    pred_label = _labels(pred_raw)
    prob_dict = None

    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(Xs)[0]
        classes = getattr(model, "classes_", None)
        if classes is not None:
            prob_dict = { _labels(c): float(p) for c, p in zip(classes, probs) }

    classes_learned = [ _labels(c) for c in getattr(model, "classes_", []) ]
    return pred_label, prob_dict, classes_learned

def predict_all_models(image_path, model_base_path="infra/models/spiral-test-classifier"):
    scaler_path = f"{model_base_path}/scaler.pkl"
    models = {
        "Logistic Regression": f"{model_base_path}/log_reg.pkl",
        "Random Forest":       f"{model_base_path}/random_forest.pkl",
        "SVM":                 f"{model_base_path}/svm.pkl",
        "MLP":                 f"{model_base_path}/mlp.pkl",
        "KNN":                 f"{model_base_path}/knn.pkl",
        "Extra Trees":         f"{model_base_path}/extra_trees.pkl",
        "Gradient Boosting":   f"{model_base_path}/gb.pkl",
        "AdaBoost":            f"{model_base_path}/adaboost.pkl",
        "LinearSVC Calib.":    f"{model_base_path}/linearsvc_calibrated.pkl",
        "Ensemble":            f"{model_base_path}/ensemble.pkl",
        "Stacking":            f"{model_base_path}/stacking.pkl"
    }

    results = {}
    predictions = []
    for name, mpath in models.items():
        pred_label, prob_dict, classes = predict_image(mpath, scaler_path, image_path)
        results[name] = {
            "prediction": pred_label,
            "probabilities": prob_dict,
            "classes_": classes
        }
        predictions.append(pred_label)

    if not predictions:
        raise ValueError("No predictions were made.")

    vote_count = Counter(predictions)
    majority = vote_count.most_common(1)[0][0]

    return results, vote_count, majority