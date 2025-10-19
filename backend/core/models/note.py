from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.models.table_registry import table_registry


@table_registry.mapped_as_dataclass
class Note:
    __tablename__ = "note"

    id: Mapped[int] = mapped_column(init=False, primary_key=True, autoincrement=True)

    content: Mapped[str] = mapped_column()
    patient_view: Mapped[bool] = mapped_column()
    test_id: Mapped[int] = mapped_column(ForeignKey("test.id"), init=False)
    associated_note_id: Mapped[int] = mapped_column(
        ForeignKey("note.id", ondelete="CASCADE"), nullable=True
    )
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctor.id"), nullable=False)

    # Self-relationship: uma nota pode ter notas filhas
    associated_notes: Mapped[list["Note"]] = relationship(
        init=False, back_populates="parent_note", foreign_keys="Note.associated_note_id"
    )
    parent_note: Mapped["Note"] = relationship(
        init=False, back_populates="associated_notes", remote_side="Note.id"
    )
