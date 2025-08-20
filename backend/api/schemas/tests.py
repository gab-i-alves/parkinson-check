from fastapi import File, HTTPException, UploadFile
from pydantic import BaseModel, model_validator

class SpiralImageSchema(BaseModel):
    image: UploadFile

    class Config:
        arbitrary_types_allowed = True
        
    @model_validator(mode="after")
    def check_if_is_image(self):
        if not self.image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Arquivo deve ser uma imagem")

    @classmethod
    def as_form(
        cls,
        image: UploadFile = File(...)
    ):
        return cls(image=image)
        
class SpiralPracticeTestResult(BaseModel):
    score: float
    analysis: str