from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from api.schemas.doctor_dashboard import (
    DashboardOverviewResponse,
    RankingsResponse,
    ScoreEvolutionResponse,
    AgeGroupAnalysisResponse,
    TestDistributionResponse,
)
from core.models import User
from core.security.security import get_doctor_user
from core.services import doctor_dashboard_service
from infra.db.connection import get_session

router = APIRouter(prefix="/doctor/dashboard", tags=["Doctor Dashboard"])

CurrentDoctor = Annotated[User, Depends(get_doctor_user())]


@router.get("/overview", response_model=DashboardOverviewResponse)
def get_dashboard_overview(
    user: CurrentDoctor,
    session: Session = Depends(get_session),
):
    """
    Retorna visão geral do dashboard com estatísticas agregadas
    de todos os pacientes vinculados ao médico.
    """
    return doctor_dashboard_service.get_dashboard_overview(session, user)


@router.get("/rankings", response_model=RankingsResponse)
def get_patient_rankings(
    user: CurrentDoctor,
    ranking_type: str = Query(
        default="overall",
        description="Tipo de ranking: 'overall', 'spiral', ou 'voice'",
    ),
    limit: int = Query(
        default=10,
        ge=1,
        le=50,
        description="Número máximo de pacientes no ranking",
    ),
    session: Session = Depends(get_session),
):
    """
    Retorna rankings de pacientes por desempenho nos testes.
    """
    return doctor_dashboard_service.get_rankings(session, user, ranking_type, limit)


@router.get("/score-evolution", response_model=ScoreEvolutionResponse)
def get_score_evolution(
    user: CurrentDoctor,
    time_period: str = Query(
        default="month",
        description="Período de análise: 'week', 'month', 'quarter', ou 'year'",
    ),
    test_type: str = Query(
        default="all",
        description="Tipo de teste: 'all', 'spiral', ou 'voice'",
    ),
    session: Session = Depends(get_session),
):
    """
    Retorna evolução das pontuações ao longo do tempo
    para todos os pacientes vinculados.
    """
    return doctor_dashboard_service.get_score_evolution(session, user, time_period, test_type)


@router.get("/age-group-analysis", response_model=AgeGroupAnalysisResponse)
def get_age_group_analysis(
    user: CurrentDoctor,
    session: Session = Depends(get_session),
):
    """
    Retorna análise de performance por faixa etária.
    """
    return doctor_dashboard_service.get_age_group_analysis(session, user)


@router.get("/test-distribution", response_model=TestDistributionResponse)
def get_test_distribution(
    user: CurrentDoctor,
    session: Session = Depends(get_session),
):
    """
    Retorna distribuição de testes por tipo e classificação.
    """
    return doctor_dashboard_service.get_test_distribution(session, user)
