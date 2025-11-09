from pydantic import BaseModel


class RegionalAverages(BaseModel):
    """Médias regionais por cidade, estado e país"""

    city: float | None = None
    state: float | None = None
    country: float | None = None


class GenderAverages(BaseModel):
    """Médias por gênero calculadas a partir da faixa etária (inferido do birthdate)"""

    male: float | None = None
    female: float | None = None


class PatientDemographics(BaseModel):
    """Informações demográficas do paciente"""

    age: int
    age_group: str  # Ex: "0-40", "41-60", "61-75", "76+"
    gender: str  # "male" ou "female" (inferido)
    city: str
    state: str
    country: str = "Brasil"


class ComparativeStatistics(BaseModel):
    """
    Estatísticas comparativas do paciente em relação ao sistema.

    Todos os cálculos agregados incluem apenas pacientes que optaram
    por compartilhar dados (share_data_for_statistics=True).
    """

    # Score do próprio paciente
    patient_avg_score: float

    # Comparações gerais
    global_avg_score: float | None = None
    age_group_avg_score: float | None = None

    # Comparações regionais
    regional_avg: RegionalAverages

    # Comparações por gênero
    gender_avg: GenderAverages

    # Posição do paciente
    patient_percentile: float | None = None  # 0-100

    # Informações demográficas do paciente
    demographics: PatientDemographics

    # Contadores para contexto
    total_patients_in_system: int
    total_patients_in_age_group: int
    total_patients_sharing_data: int
