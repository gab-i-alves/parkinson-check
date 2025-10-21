from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, func
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.enums import NoteCategory
from core.models.table_registry import table_registry

if TYPE_CHECKING:
    from core.models.users import Doctor


@table_registry.mapped_as_dataclass
class Note:
    __tablename__ = "note"

    id: Mapped[int] = mapped_column(init=False, primary_key=True, autoincrement=True)

    content: Mapped[str] = mapped_column()
    patient_view: Mapped[bool] = mapped_column()
    test_id: Mapped[int] = mapped_column(ForeignKey("test.id"))
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctor.id"), nullable=False)
    category: Mapped[NoteCategory] = mapped_column(
        PG_ENUM(NoteCategory, name="note_category_enum", create_type=True),
        default=NoteCategory.OBSERVATION
    )

    created_at: Mapped[datetime] = mapped_column(init=False, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(init=False, default=func.now(), onupdate=func.now())

    # Foreign key para a nota "pai"
    parent_note_id: Mapped[int] = mapped_column(
        ForeignKey("note.id", ondelete="CASCADE"), nullable=True, default=None
    )

    # Relação: médico que criou a nota
    doctor: Mapped["Doctor"] = relationship(
        "Doctor",
        foreign_keys=[doctor_id],
        init=False
    )

    # Relação: nota pai (acessa a nota que é pai desta)
    parent_note: Mapped["Note"] = relationship(
        "Note",
        remote_side="Note.id",
        foreign_keys=[parent_note_id],
        back_populates="linked_notes",
        init=False
    )

    # Relação: notas filhas (acessa as notas que tem esta como pai)
    linked_notes: Mapped[list["Note"]] = relationship(
        "Note",
        back_populates="parent_note",
        foreign_keys="Note.parent_note_id",
        init=False,
        default_factory=list
    )
