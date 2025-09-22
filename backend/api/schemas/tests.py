from fastapi import File, HTTPException, UploadFile
from pydantic import BaseModel, model_validator
from typing import Dict, Optional

class SpiralImageSchema(BaseModel):
    image: bytes

    # class Config:
    #     arbitrary_types_allowed = True
        
    # @model_validator(mode="after")
    # def check_if_is_image(self):
    #     if not self.image.content_type.startswith("image/"):
    #         raise HTTPException(status_code=400, detail="Arquivo deve ser uma imagem")

    @classmethod
    def as_form(
        cls,
        image: UploadFile = File(...)
    ):
        return cls(image=image.file.read())
        
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