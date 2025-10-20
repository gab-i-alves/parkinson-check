from typing import Optional

from pydantic import BaseModel


class CreateNoteSchema(BaseModel):
    content: str
    test_id: int
    parent_note_id: Optional[int] 
    patient_view: bool


class NoteSchema(BaseModel):
    id: int
    content: str
    test_id: int
    parent_note_id: Optional[int]
    patient_view: bool
    doctor_id: int
    
    model_config = {"from_attributes": True}


class UpdateNoteSchema(BaseModel):
    content: str
    patient_view: bool


class DoctorInfo(BaseModel):
    """Informações básicas do médico criador da nota"""
    id: int
    name: str
    crm: str

    model_config = {"from_attributes": True}


class NoteResponse(NoteSchema):
    linked_notes: Optional[list[NoteSchema]]
    parent_note: Optional[NoteSchema]
    doctor: DoctorInfo

    model_config = {"from_attributes": True}
