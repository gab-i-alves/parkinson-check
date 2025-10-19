from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.models.table_registry import table_registry


@table_registry.mapped_as_dataclass
class Note:
    __tablename__ = "note"

    id: Mapped[int] = mapped_column(init=False, primary_key=True, autoincrement=True)

    content: Mapped[str] = mapped_column()
    patient_view: Mapped[bool] = mapped_column()
    test_id: Mapped[int] = mapped_column(ForeignKey("test.id"))
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctor.id"), nullable=False)
    
    # Foreign key para a nota "pai"
    parent_note_id: Mapped[int] = mapped_column(
        ForeignKey("note.id", ondelete="CASCADE"), nullable=True
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
