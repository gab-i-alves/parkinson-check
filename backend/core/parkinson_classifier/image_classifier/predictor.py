from fastapi import UploadFile
import cv2
import numpy as np
import joblib
from keras.applications import ResNet50
from keras.applications.resnet50 import preprocess_input
from infra.settings import Settings

RF_MODEL = joblib.load(Settings().MODEL_PATH)
FEATURE_EXTRACTOR = ResNet50(weights="imagenet", include_top=False, pooling="avg")

def process_spiral_image(image: UploadFile) -> float:
    image_bytes = image.file.read()

    np_arr = np.frombuffer(image_bytes, np.uint8)
    
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    
    # Keras espera imagens no formato de cor RGB, mas OpenCV carrega em BGR
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # A ResNet50 foi treinada com imagens de 224x224 pixels
    img = cv2.resize(img, (224, 224))
    
    # Faz os ajustes finais (como normalização de pixels) que a ResNet50 espera
    img = preprocess_input(img)
    
    # O modelo espera um "lote" (batch) de imagens. Adicionamos uma dimensão extra.
    # O shape passa de (224, 224, 3) para (1, 224, 224, 3)
    img = np.expand_dims(img, axis=0)

    return predic_parkinson_prob(img)
    
def predic_parkinson_prob(img) -> float: 
    features = FEATURE_EXTRACTOR.predict(img)
    # Usa o Random Forest para prever as probabilidades nas características extraídas
    # O predict_proba retorna um array com as probs para cada classe, ex: [[prob_saudavel, prob_parkinson]]
    probs = RF_MODEL.predict_proba(features)
    # Probabilidade da classe "1" (Parkinson)
    prob_parkinon = probs[0][1]
    print(prob_parkinon)
    return prob_parkinon
    