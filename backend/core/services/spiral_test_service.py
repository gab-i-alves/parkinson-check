import tempfile
import os
from fastapi import UploadFile
from api.schemas.tests import SpiralImageSchema, SpiralPracticeTestResult
from ..parkinson_classifier.predictor import predict_all_models

def process_spiral_as_practice(schema: SpiralImageSchema) -> SpiralPracticeTestResult:
    # Salva a imagem recebida em um arquivo temporário
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(schema.image)
        image_path = tmp.name

    try:
        # Chama o novo sistema de predição
        results, vote_count, majority = predict_all_models(image_path)

        # Formata o dicionário de resultados para o schema Pydantic
        # Removendo 'classes_' que não será usado no frontend
        formatted_results = {
            name: {"prediction": data["prediction"], "probabilities": data["probabilities"]}
            for name, data in results.items()
        }

        # Monta o objeto de retorno
        response = SpiralPracticeTestResult(
            majority_decision=majority,
            vote_count={
                "Healthy": vote_count.get("Healthy", 0),
                "Parkinson": vote_count.get("Parkinson", 0)
            },
            model_results=formatted_results
        )
        return response

    finally:
        # Garante que o arquivo temporário seja removido
        os.remove(image_path)