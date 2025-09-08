from api.schemas.tests import SpiralImageSchema, PracticeTestResult, VoiceAudioSchema
from ..parkinson_classifier.image_classifier.predictor import process_spiral_image

def process_spiral_as_practice(schema: SpiralImageSchema) -> PracticeTestResult:
    result = process_spiral_image(schema.image)
    
    #Precisa de base téorica
    
    if result >= 0.99:
        analysis = "Parkinson"
    elif result >= 0.6:
        analysis = "Chance de Parkinson"
    elif result >= 0.4:
        analysis = "Baixa chance de Parkison"
    else:
        analysis = "Normal"
    
    return PracticeTestResult(score=result, analysis=analysis)

def process_voice_as_practice(schema: VoiceAudioSchema) -> PracticeTestResult:
    ...