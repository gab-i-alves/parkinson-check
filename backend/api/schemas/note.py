from typing import Optional

from pydantic import BaseModel


class CreateNoteSchema(BaseModel):
    content: str
    test_id: int
    associated_note_id: Optional[int] = None
    patient_view: bool


class NoteSchema(BaseModel):
    content: str
    test_id: int
    associated_note_id: Optional[int] = None
    patient_view: bool
    doctor_id: int


class UpdateNoteSchema(BaseModel):
    content: str
    patient_view: bool


class NoteResponse(NoteSchema):
    associated_note: Optional[list[NoteSchema]] = None
    parent_note: Optional[NoteSchema] = None
