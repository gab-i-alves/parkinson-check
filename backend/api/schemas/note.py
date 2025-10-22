from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from core.enums import NoteCategory


class CreateNoteSchema(BaseModel):
    content: str = Field(..., min_length=10, max_length=5000)
    test_id: int
    parent_note_id: Optional[int] = None
    patient_view: bool = False
    category: NoteCategory = NoteCategory.OBSERVATION


class NoteSchema(BaseModel):
    id: int
    content: str
    test_id: int
    parent_note_id: Optional[int]
    patient_view: bool
    category: NoteCategory
    doctor_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UpdateNoteSchema(BaseModel):
    content: str = Field(..., min_length=10, max_length=5000)
    patient_view: bool
    category: NoteCategory


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
