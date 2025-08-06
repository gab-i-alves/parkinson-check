from pydantic import BaseModel


class RequestBinding(BaseModel):
    doctor_id: int