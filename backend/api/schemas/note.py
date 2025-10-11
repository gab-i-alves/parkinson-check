from typing import Optional
from pydantic import BaseModel


class NoteSchema(BaseModel):
    content: str
    test_id: int
    associated_note_id: Optional[int] = None

class NoteResponse(BaseModel):
    id: int
    content: str
    test_id: int
    associated_note: Optional[list[NoteSchema]] = None
    parent_note: Optional[NoteSchema] = None
    
    