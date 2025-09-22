from fastapi import File, HTTPException, UploadFile
from pydantic import BaseModel, model_validator
from typing import Dict, Optional

class SpiralImageSchema(BaseModel):
    image_content: bytes
    image_filename: str
    image_content_type: str

    @classmethod
    def as_form(
        cls,
        image: UploadFile = File(...)
    ):
        return cls(
            image_content=image.file.read(),
            image_filename=image.filename,
            image_content_type=image.content_type
        )
        
class ModelPrediction(BaseModel):
    prediction: str
    probabilities: Optional[Dict[str, float]] = None

class SpiralTestVoteCount(BaseModel):
    Healthy: int
    Parkinson: int

class SpiralPracticeTestResult(BaseModel):
    majority_decision: str
    vote_count: SpiralTestVoteCount
    model_results: Dict[str, ModelPrediction]