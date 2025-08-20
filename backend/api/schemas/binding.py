from pydantic import BaseModel

from core.enums.bind_enum import BindEnum


class RequestBinding(BaseModel):
    doctor_id: int
    
class Bind(BaseModel):
    id: int
    status: BindEnum
    doctor_id: int
    patient_id: int
    
    model_config = {'from_attributes': True}