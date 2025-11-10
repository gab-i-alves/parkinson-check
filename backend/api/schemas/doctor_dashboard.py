from pydantic import BaseModel
from datetime import datetime


class PatientsByStatus(BaseModel):
    """Distribuição de pacientes por status"""

    stable: int
    attention: int
    critical: int


class DashboardOverviewResponse(BaseModel):
    """Visão geral do dashboard do médico com estatísticas agregadas"""

    total_patients: int
    patients_by_status: PatientsByStatus
    total_tests: int
    total_tests_this_month: int
    avg_score_all_patients: float | None = None


class PatientRanking(BaseModel):
    """Informações de ranking de um paciente"""

    patient_id: int
    patient_name: str
    avg_score: float
    total_tests: int
    last_test_date: datetime | None = None


class RankingsResponse(BaseModel):
    """Rankings de pacientes por tipo de teste"""

    top_spiral_scores: list[PatientRanking]
    top_voice_scores: list[PatientRanking]
    top_overall_scores: list[PatientRanking]


class TimeSeriesDataPoint(BaseModel):
    """Ponto de dados em série temporal"""

    date: str  # Formato: "2025-11-01"
    avg_score: float
    test_count: int


class ScoreEvolutionResponse(BaseModel):
    """Evolução das pontuações ao longo do tempo"""

    time_series: list[TimeSeriesDataPoint]
    overall_trend: str  # "improving" | "stable" | "worsening"
    trend_percentage: float | None = None


class AgeGroupData(BaseModel):
    """Dados de performance por faixa etária"""

    age_range: str  # Ex: "0-40", "41-60", "61-75", "76+"
    avg_score: float
    patient_count: int
    avg_spiral_score: float | None = None
    avg_voice_score: float | None = None


class AgeGroupAnalysisResponse(BaseModel):
    """Análise de performance por faixa etária"""

    age_groups: list[AgeGroupData]


class TestTypeData(BaseModel):
    """Dados de um tipo de teste"""

    count: int
    percentage: float
    avg_score: float


class TestDistributionResponse(BaseModel):
    """Distribuição de testes por tipo e status"""

    total_tests: int
    spiral_tests: TestTypeData
    voice_tests: TestTypeData
    by_classification: dict[str, int]  # {"healthy": 10, "parkinson": 5}
