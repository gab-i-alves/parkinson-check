from enum import Enum


class NoteCategory(str, Enum):
    """Categorias de notas médicas"""

    OBSERVATION = "OBSERVATION"  # Observação
    RECOMMENDATION = "RECOMMENDATION"  # Recomendação
    ALERT = "ALERT"  # Alerta
