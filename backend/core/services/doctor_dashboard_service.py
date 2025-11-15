from datetime import datetime, timedelta
from sqlalchemy import func, desc, and_, extract
from sqlalchemy.orm import Session

from api.schemas.doctor_dashboard import (
    DashboardOverviewResponse,
    PatientsByStatus,
    RankingsResponse,
    PatientRanking,
    ScoreEvolutionResponse,
    TimeSeriesDataPoint,
    AgeGroupAnalysisResponse,
    AgeGroupData,
    TestDistributionResponse,
    TestTypeData,
)
from core.models import Bind, Patient, Test, User
from core.enums import BindEnum, TestType

# Threshold de classificação (mesmo valor de test_service.py)
HEALTHY_THRESHOLD = 0.7


def _calculate_age(birthdate: datetime) -> int:
    """Calcula idade baseado na data de nascimento"""
    today = datetime.now().date()
    birthdate_date = birthdate.date() if isinstance(birthdate, datetime) else birthdate
    return today.year - birthdate_date.year - (
        (today.month, today.day) < (birthdate_date.month, birthdate_date.day)
    )


def _get_age_group(age: int) -> str:
    """Retorna faixa etária baseado na idade"""
    if age <= 40:
        return "0-40"
    elif age <= 60:
        return "41-60"
    elif age <= 75:
        return "61-75"
    else:
        return "76+"


def _calculate_status(avg_score: float | None) -> str:
    """Calcula status do paciente baseado na pontuação média"""
    if avg_score is None:
        return "stable"
    if avg_score >= HEALTHY_THRESHOLD:
        return "stable"
    elif avg_score >= 0.4:
        return "attention"
    else:
        return "critical"


def get_dashboard_overview(session: Session, doctor: User) -> DashboardOverviewResponse:
    """Retorna visão geral do dashboard com estatísticas agregadas"""

    # Buscar IDs dos pacientes vinculados
    linked_patient_ids = (
        session.query(Bind.patient_id)
        .filter(Bind.doctor_id == doctor.id, Bind.status == BindEnum.ACTIVE)
        .all()
    )
    patient_ids = [pid[0] for pid in linked_patient_ids]

    if not patient_ids:
        return DashboardOverviewResponse(
            total_patients=0,
            patients_by_status=PatientsByStatus(stable=0, attention=0, critical=0),
            total_tests=0,
            total_tests_this_month=0,
            avg_score_all_patients=None,
        )

    # Calcular status de cada paciente baseado nos últimos 5 testes
    status_counts = {"stable": 0, "attention": 0, "critical": 0}

    for patient_id in patient_ids:
        last_five_tests = (
            session.query(Test.score)
            .filter(Test.patient_id == patient_id)
            .order_by(desc(Test.execution_date))
            .limit(5)
            .all()
        )

        if last_five_tests:
            avg_score = sum(score[0] for score in last_five_tests) / len(last_five_tests)
            status = _calculate_status(avg_score)
            status_counts[status] += 1
        else:
            status_counts["stable"] += 1

    # Total de testes
    total_tests = (
        session.query(func.count(Test.id))
        .filter(Test.patient_id.in_(patient_ids))
        .scalar()
    )

    # Testes deste mês
    first_day_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    total_tests_this_month = (
        session.query(func.count(Test.id))
        .filter(
            Test.patient_id.in_(patient_ids),
            Test.execution_date >= first_day_of_month,
        )
        .scalar()
    )

    # Pontuação média de todos os pacientes
    avg_score_result = (
        session.query(func.avg(Test.score))
        .filter(Test.patient_id.in_(patient_ids))
        .scalar()
    )
    avg_score_all_patients = float(avg_score_result) if avg_score_result else None

    return DashboardOverviewResponse(
        total_patients=len(patient_ids),
        patients_by_status=PatientsByStatus(
            stable=status_counts["stable"],
            attention=status_counts["attention"],
            critical=status_counts["critical"],
        ),
        total_tests=total_tests or 0,
        total_tests_this_month=total_tests_this_month or 0,
        avg_score_all_patients=avg_score_all_patients,
    )


def get_rankings(
    session: Session, doctor: User, ranking_type: str = "overall", limit: int = 10
) -> RankingsResponse:
    """Retorna rankings de pacientes por desempenho"""

    # Buscar IDs dos pacientes vinculados
    linked_patient_ids = (
        session.query(Bind.patient_id)
        .filter(Bind.doctor_id == doctor.id, Bind.status == BindEnum.ACTIVE)
        .all()
    )
    patient_ids = [pid[0] for pid in linked_patient_ids]

    def get_ranking_for_test_type(test_type: TestType | None):
        query = (
            session.query(
                Patient.id,
                Patient.name,
                func.avg(Test.score).label("avg_score"),
                func.count(Test.id).label("total_tests"),
                func.max(Test.execution_date).label("last_test_date"),
            )
            .join(Test, Test.patient_id == Patient.id)
            .filter(
                Patient.id.in_(patient_ids),
            )
        )

        if test_type:
            query = query.filter(Test.test_type == test_type)

        results = (
            query
            .group_by(Patient.id, Patient.name)
            .order_by(desc("avg_score"))
            .limit(limit)
            .all()
        )

        return [
            PatientRanking(
                patient_id=r.id,
                patient_name=r.name,
                avg_score=float(r.avg_score),
                total_tests=r.total_tests,
                last_test_date=r.last_test_date,
            )
            for r in results
        ]

    return RankingsResponse(
        top_spiral_scores=get_ranking_for_test_type(TestType.SPIRAL_TEST),
        top_voice_scores=get_ranking_for_test_type(TestType.VOICE_TEST),
        top_overall_scores=get_ranking_for_test_type(None),
    )


def get_score_evolution(
    session: Session, doctor: User, time_period: str = "month", test_type: str = "all"
) -> ScoreEvolutionResponse:
    """Retorna evolução das pontuações ao longo do tempo"""

    # Buscar IDs dos pacientes vinculados
    linked_patient_ids = (
        session.query(Bind.patient_id)
        .filter(Bind.doctor_id == doctor.id, Bind.status == BindEnum.ACTIVE)
        .all()
    )
    patient_ids = [pid[0] for pid in linked_patient_ids]

    # Determinar período
    if time_period == "week":
        start_date = datetime.now() - timedelta(days=7)
    elif time_period == "quarter":
        start_date = datetime.now() - timedelta(days=90)
    elif time_period == "year":
        start_date = datetime.now() - timedelta(days=365)
    else:  # month
        start_date = datetime.now() - timedelta(days=30)

    query = (
        session.query(
            func.date(Test.execution_date).label("date"),
            func.avg(Test.score).label("avg_score"),
            func.count(Test.id).label("test_count"),
        )
        .filter(
            Test.patient_id.in_(patient_ids),
            Test.execution_date >= start_date,
        )
    )

    if test_type == "spiral":
        query = query.filter(Test.test_type == TestType.SPIRAL_TEST)
    elif test_type == "voice":
        query = query.filter(Test.test_type == TestType.VOICE_TEST)

    results = query.group_by(func.date(Test.execution_date)).order_by("date").all()

    time_series = [
        TimeSeriesDataPoint(
            date=str(r.date), avg_score=float(r.avg_score), test_count=r.test_count
        )
        for r in results
    ]

    # Calcular tendência
    if len(time_series) >= 2:
        first_avg = time_series[0].avg_score
        last_avg = time_series[-1].avg_score
        trend_percentage = ((last_avg - first_avg) / first_avg) * 100 if first_avg > 0 else 0

        if trend_percentage > 5:
            overall_trend = "improving"
        elif trend_percentage < -5:
            overall_trend = "worsening"
        else:
            overall_trend = "stable"
    else:
        overall_trend = "stable"
        trend_percentage = 0.0

    return ScoreEvolutionResponse(
        time_series=time_series,
        overall_trend=overall_trend,
        trend_percentage=trend_percentage,
    )


def get_age_group_analysis(session: Session, doctor: User) -> AgeGroupAnalysisResponse:
    """Retorna análise de performance por faixa etária"""

    # Buscar IDs dos pacientes vinculados
    linked_patient_ids = (
        session.query(Bind.patient_id)
        .filter(Bind.doctor_id == doctor.id, Bind.status == BindEnum.ACTIVE)
        .all()
    )
    patient_ids = [pid[0] for pid in linked_patient_ids]

    # Buscar pacientes com testes
    patients_with_tests = (
        session.query(Patient.id, Patient.birthdate)
        .filter(Patient.id.in_(patient_ids))
        .all()
    )

    # Agrupar por faixa etária
    age_groups_data = {}

    for patient_id, birthdate in patients_with_tests:
        age = _calculate_age(birthdate)
        age_group = _get_age_group(age)

        if age_group not in age_groups_data:
            age_groups_data[age_group] = {
                "patient_ids": [],
                "scores": [],
                "spiral_scores": [],
                "voice_scores": [],
            }

        age_groups_data[age_group]["patient_ids"].append(patient_id)

        # Buscar testes do paciente
        tests = (
            session.query(Test.score, Test.test_type)
            .filter(Test.patient_id == patient_id)
            .all()
        )

        for score, test_type in tests:
            age_groups_data[age_group]["scores"].append(score)
            if test_type == TestType.SPIRAL_TEST:
                age_groups_data[age_group]["spiral_scores"].append(score)
            elif test_type == TestType.VOICE_TEST:
                age_groups_data[age_group]["voice_scores"].append(score)

    # Calcular médias
    age_groups = []
    for age_range in ["0-40", "41-60", "61-75", "76+"]:
        if age_range in age_groups_data:
            data = age_groups_data[age_range]
            age_groups.append(
                AgeGroupData(
                    age_range=age_range,
                    avg_score=sum(data["scores"]) / len(data["scores"]) if data["scores"] else 0.0,
                    patient_count=len(data["patient_ids"]),
                    avg_spiral_score=(
                        sum(data["spiral_scores"]) / len(data["spiral_scores"])
                        if data["spiral_scores"]
                        else None
                    ),
                    avg_voice_score=(
                        sum(data["voice_scores"]) / len(data["voice_scores"])
                        if data["voice_scores"]
                        else None
                    ),
                )
            )

    return AgeGroupAnalysisResponse(age_groups=age_groups)


def get_test_distribution(session: Session, doctor: User) -> TestDistributionResponse:
    """Retorna distribuição de testes por tipo e classificação"""

    # Buscar IDs dos pacientes vinculados
    linked_patient_ids = (
        session.query(Bind.patient_id)
        .filter(Bind.doctor_id == doctor.id, Bind.status == BindEnum.ACTIVE)
        .all()
    )
    patient_ids = [pid[0] for pid in linked_patient_ids]

    # Total de testes
    total_tests = (
        session.query(func.count(Test.id))
        .filter(Test.patient_id.in_(patient_ids))
        .scalar()
    ) or 0

    # Testes por tipo
    spiral_data = (
        session.query(func.count(Test.id), func.avg(Test.score))
        .filter(
            Test.patient_id.in_(patient_ids),
            Test.test_type == TestType.SPIRAL_TEST,
        )
        .first()
    )

    voice_data = (
        session.query(func.count(Test.id), func.avg(Test.score))
        .filter(
            Test.patient_id.in_(patient_ids),
            Test.test_type == TestType.VOICE_TEST,
        )
        .first()
    )

    spiral_count = spiral_data[0] or 0
    voice_count = voice_data[0] or 0

    # Classificação (healthy vs parkinson)
    healthy_count = (
        session.query(func.count(Test.id))
        .filter(
            Test.patient_id.in_(patient_ids),
            Test.score >= HEALTHY_THRESHOLD,
        )
        .scalar()
    ) or 0

    parkinson_count = (
        session.query(func.count(Test.id))
        .filter(
            Test.patient_id.in_(patient_ids),
            Test.score < HEALTHY_THRESHOLD,
        )
        .scalar()
    ) or 0

    return TestDistributionResponse(
        total_tests=total_tests,
        spiral_tests=TestTypeData(
            count=spiral_count,
            percentage=(spiral_count / total_tests * 100) if total_tests > 0 else 0.0,
            avg_score=float(spiral_data[1]) if spiral_data[1] else 0.0,
        ),
        voice_tests=TestTypeData(
            count=voice_count,
            percentage=(voice_count / total_tests * 100) if total_tests > 0 else 0.0,
            avg_score=float(voice_data[1]) if voice_data[1] else 0.0,
        ),
        by_classification={"healthy": healthy_count, "parkinson": parkinson_count},
    )
