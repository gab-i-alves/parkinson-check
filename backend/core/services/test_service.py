from http import HTTPStatus

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from api.schemas.tests import (
    BasicTestReturn,
    ClinicalProcessSpiralSchema,
    ClinicalProcessVoiceSchema,
    ClinicalSpiralTestResult,
    ClinicalVoiceTestResult,
    DetaildTestsReturn,
    PatientTestStatistics,
    PatientTestTimeline,
    ProcessSpiralSchema,
    ProcessVoiceSchema,
    SpiralImageSchema,
    SpiralTestDetail,
    SpiralTestResult,
    TimelineTestItem,
    VoiceTestDetail,
    VoiceTestResult,
)

from ..enums.test_enum import TestType
from ..models import SpiralTest, Test, User, VoiceTest
from ..utils import ai
from .user_service import get_user_active_binds
from infra.settings import settings

SPIRAL_MODEL_SERVICE_URL = f"{settings.SPIRAL_CLASSIFIER_URL}/predict/spiral"
VOICE_MODEL_SERVICE_URL = f"{settings.VOICE_CLASSIFIER_URL}/predict/voice"

# Threshold de classificação: score >= 0.7 = HEALTHY, score < 0.7 = PARKINSON
# Score representa probabilidade de estar saudável (0.0-1.0)
HEALTHY_THRESHOLD = 0.7


def process_spiral(
    schema: ProcessSpiralSchema, user: User, session: Session
) -> tuple[SpiralTestResult, int]:
    """
    Processa teste de espiral e salva no banco de dados.

    Returns:
        tuple: (SpiralTestResult, test_id)
    """
    model_result = ai.get_spiral_image_models_response(
        schema.image, SPIRAL_MODEL_SERVICE_URL
    )

    # Calcular média das probabilidades de Parkinson dos 11 modelos
    parkinson_probabilities = []
    for model_prediction in model_result.model_results.values():
        if model_prediction.probabilities:
            parkinson_prob = model_prediction.probabilities.get("Parkinson", 0.0)
            parkinson_probabilities.append(parkinson_prob)

    avg_parkinson_prob = sum(parkinson_probabilities) / len(parkinson_probabilities) if parkinson_probabilities else 0.0

    # Score = probabilidade de estar saudável (inverso da probabilidade de Parkinson)
    score = 1.0 - avg_parkinson_prob

    spiral_test_db = SpiralTest(
        test_type=TestType.SPIRAL_TEST,
        score=score,
        patient_id=user.id,
        draw_duration=schema.draw_duration,
        method=schema.method,
    )

    # Armazena resultados dos modelos (converter Pydantic para dict para serialização JSON)
    spiral_test_db.model_predictions = {
        key: pred.model_dump() if hasattr(pred, 'model_dump') else pred.dict()
        for key, pred in model_result.model_results.items()
    }
    spiral_test_db.avg_parkinson_probability = avg_parkinson_prob
    spiral_test_db.majority_vote = model_result.majority_decision
    spiral_test_db.healthy_votes = model_result.vote_count.Healthy
    spiral_test_db.parkinson_votes = model_result.vote_count.Parkinson

    # Armazena a imagem no banco de dados
    spiral_test_db.spiral_image_data = schema.image.image_content
    spiral_test_db.spiral_image_filename = schema.image.image_filename
    spiral_test_db.spiral_image_content_type = schema.image.image_content_type

    session.add(spiral_test_db)
    session.commit()
    session.refresh(spiral_test_db)  # Garante que temos o ID gerado

    return model_result, spiral_test_db.id


def process_voice(
    schema: ProcessVoiceSchema, user: User, session: Session
) -> tuple[VoiceTestResult, int]:
    """
    Processa teste de voz e salva no banco de dados.

    Returns:
        tuple: (VoiceTestResult, test_id)
    """
    model_result = ai.get_voice_model_response(schema.audio_file, VOICE_MODEL_SERVICE_URL)

    # Lê o conteúdo do arquivo de áudio para armazenar
    schema.audio_file.file.seek(0)  # Volta ao início do arquivo
    audio_content = schema.audio_file.file.read()

    # model_result.score é a probabilidade de Parkinson (0-100 ou 0-1)
    # Assumindo que vem em formato 0-100 (percentual)
    raw_parkinson_prob = model_result.score / 100.0 if model_result.score > 1 else model_result.score

    # Score = probabilidade de estar saudável (inverso da probabilidade de Parkinson)
    score = 1.0 - raw_parkinson_prob

    voice_test_db = VoiceTest(
        test_type=TestType.VOICE_TEST,
        score=score,
        patient_id=user.id,
        record_duration=schema.record_duration,
    )

    # Armazena probabilidade original
    voice_test_db.raw_parkinson_probability = raw_parkinson_prob

    # Armazena o áudio no banco de dados
    voice_test_db.voice_audio_data = audio_content
    voice_test_db.voice_audio_filename = schema.audio_file.filename
    voice_test_db.voice_audio_content_type = schema.audio_file.content_type

    session.add(voice_test_db)
    session.commit()
    session.refresh(voice_test_db)  # Garante que temos o ID gerado

    return model_result, voice_test_db.id


def process_spiral_as_practice(schema: SpiralImageSchema) -> SpiralTestResult:
    return ai.get_spiral_image_models_response(schema, SPIRAL_MODEL_SERVICE_URL)


def process_voice_as_practice(audio_file: UploadFile) -> VoiceTestResult:
    return ai.get_voice_model_response(audio_file, VOICE_MODEL_SERVICE_URL)


def get_patient_tests(
    session: Session, current_user: User, patient_id: int
) -> list[BasicTestReturn]:
    binds = get_user_active_binds(session, current_user)

    if not binds:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Paciente não encontrado."
        )

    if patient_id not in [bind.patient_id for bind in binds]:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="O médico não tem acesso ao paciente informado.",
        )

    db_tests = (
        session.query(Test)
        .filter(
            Test.patient_id == patient_id,
        )
        .all()
    )

    test_results = []

    for test in db_tests:
        patient_test = BasicTestReturn(
            test_id=test.id,
            test_type=test.test_type,
            execution_date=test.execution_date,
            classification="HEALTHY" if test.score >= HEALTHY_THRESHOLD else "PARKINSON",
        )
        test_results.append(patient_test)

    return test_results


def get_patient_detaild_tests(
    session: Session, current_user: User, patient_id: int
) -> DetaildTestsReturn:
    binds = get_user_active_binds(session, current_user)

    if not binds:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Paciente não encontrado."
        )

    if patient_id not in [bind.patient_id for bind in binds]:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="O médico não tem acesso ao paciente informado.",
        )

    voice_tests_db = (
        session.query(VoiceTest)
        .filter(
            VoiceTest.patient_id == patient_id,
        )
        .all()
    )

    spiral_tests_db = (
        session.query(SpiralTest)
        .filter(
            SpiralTest.patient_id == patient_id,
        )
        .all()
    )

    # O FastAPI deve serializar automaticamente para os schemas
    test_results = DetaildTestsReturn(
        voice_tests=voice_tests_db, spiral_tests=spiral_tests_db
    )

    return test_results


# Funções para testes clínicos (iniciados pelo médico)


def process_clinical_spiral(
    schema: ClinicalProcessSpiralSchema, doctor: User, session: Session
) -> ClinicalSpiralTestResult:
    """
    Processa teste de espiral clínico iniciado pelo médico.

    Valida se o médico tem vínculo ativo com o paciente antes de processar.

    Args:
        schema: Dados do teste incluindo patient_id
        doctor: Médico logado que está conduzindo o teste
        session: Sessão do banco de dados

    Returns:
        ClinicalSpiralTestResult com informações detalhadas do teste

    Raises:
        HTTPException: Se médico não tem vínculo com paciente
    """
    # Valida se o médico tem acesso ao paciente
    binds = get_user_active_binds(session, doctor)

    if not binds:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Você não possui pacientes vinculados.",
        )

    if schema.patient_id not in [bind.patient_id for bind in binds]:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="Você não tem acesso a este paciente.",
        )

    # Busca o paciente
    patient = session.query(User).filter(User.id == schema.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Paciente não encontrado."
        )

    # Cria schema de processamento normal com os dados do paciente
    process_schema = ProcessSpiralSchema(
        image=schema.image, draw_duration=schema.draw_duration, method=schema.method
    )

    # Processa o teste usando a função existente
    model_result, test_id = process_spiral(process_schema, patient, session)

    # Busca o teste criado para pegar execution_date
    test_db = session.query(SpiralTest).filter(SpiralTest.id == test_id).first()

    # Retorna resultado detalhado para o médico
    return ClinicalSpiralTestResult(
        test_id=test_id,
        patient_id=schema.patient_id,
        majority_decision=model_result.majority_decision,
        vote_count=model_result.vote_count,
        model_results=model_result.model_results,
        score=test_db.score,
        execution_date=test_db.execution_date,
    )


def process_clinical_voice(
    schema: ClinicalProcessVoiceSchema, doctor: User, session: Session
) -> ClinicalVoiceTestResult:
    """
    Processa teste de voz clínico iniciado pelo médico.

    Valida se o médico tem vínculo ativo com o paciente antes de processar.

    Args:
        schema: Dados do teste incluindo patient_id
        doctor: Médico logado que está conduzindo o teste
        session: Sessão do banco de dados

    Returns:
        ClinicalVoiceTestResult com informações detalhadas do teste

    Raises:
        HTTPException: Se médico não tem vínculo com paciente
    """
    # Valida se o médico tem acesso ao paciente
    binds = get_user_active_binds(session, doctor)

    if not binds:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Você não possui pacientes vinculados.",
        )

    if schema.patient_id not in [bind.patient_id for bind in binds]:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="Você não tem acesso a este paciente.",
        )

    # Busca o paciente
    patient = session.query(User).filter(User.id == schema.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Paciente não encontrado."
        )

    # Cria schema de processamento normal com os dados do paciente
    process_schema = ProcessVoiceSchema(
        record_duration=schema.record_duration, audio_file=schema.audio_file
    )

    # Processa o teste usando a função existente
    model_result, test_id = process_voice(process_schema, patient, session)

    # Busca o teste criado para pegar execution_date
    test_db = session.query(VoiceTest).filter(VoiceTest.id == test_id).first()

    # Retorna resultado detalhado para o médico
    return ClinicalVoiceTestResult(
        test_id=test_id,
        patient_id=schema.patient_id,
        score=model_result.score,
        analysis=model_result.analysis,
        execution_date=test_db.execution_date,
    )


# Funções para estatísticas e timeline do paciente


def get_my_tests_statistics(session: Session, patient: User) -> PatientTestStatistics:
    """
    Retorna estatísticas agregadas dos testes do próprio paciente.
    Inclui tendência calculada por regressão linear simples.
    """
    from datetime import datetime, timezone

    # Busca todos os testes ordenados cronologicamente
    all_tests = (
        session.query(Test)
        .filter(Test.patient_id == patient.id)
        .order_by(Test.execution_date)
        .all()
    )

    if not all_tests:
        return PatientTestStatistics(
            total_tests=0,
            total_spiral_tests=0,
            total_voice_tests=0,
            avg_spiral_score=None,
            avg_voice_score=None,
            last_test_date=None,
            days_since_last_test=None,
            first_test_date=None,
            trend="stable",
            trend_percentage=0.0,
            best_spiral_score=None,
            worst_spiral_score=None,
            best_voice_score=None,
            worst_voice_score=None,
            healthy_classification_count=0,
            parkinson_classification_count=0,
            avg_test_interval_days=None,
        )

    # Separar por tipo
    spiral_tests = [t for t in all_tests if t.test_type == TestType.SPIRAL_TEST]
    voice_tests = [t for t in all_tests if t.test_type == TestType.VOICE_TEST]

    # Calcular estatísticas básicas
    total_tests = len(all_tests)
    total_spiral = len(spiral_tests)
    total_voice = len(voice_tests)

    avg_spiral = (
        sum(t.score for t in spiral_tests) / total_spiral if total_spiral > 0 else None
    )
    avg_voice = sum(t.score for t in voice_tests) / total_voice if total_voice > 0 else None

    # Último teste
    last_test = all_tests[-1]
    last_test_date = last_test.execution_date
    days_since_last = (datetime.now(timezone.utc) - last_test_date).days

    # Primeiro teste
    first_test_date = all_tests[0].execution_date

    # Calcular tendência (regressão linear simples - sem numpy)
    scores = [t.score for t in all_tests]
    if len(scores) >= 2:
        n = len(scores)
        x = list(range(n))
        y = scores

        # Cálculo manual de regressão linear: y = mx + b
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(x[i] * y[i] for i in range(n))
        sum_x2 = sum(xi**2 for xi in x)

        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x**2)

        if slope > 0.01:
            trend = "improving"
        elif slope < -0.01:
            trend = "worsening"
        else:
            trend = "stable"

        trend_percentage = (slope * n) * 100 if n > 1 else 0.0
    else:
        trend = "stable"
        trend_percentage = 0.0

    # Melhores e piores scores
    best_spiral = max((t.score for t in spiral_tests), default=None)
    worst_spiral = min((t.score for t in spiral_tests), default=None)
    best_voice = max((t.score for t in voice_tests), default=None)
    worst_voice = min((t.score for t in voice_tests), default=None)

    # Classificações
    healthy_count = sum(1 for t in all_tests if t.score >= HEALTHY_THRESHOLD)
    parkinson_count = sum(1 for t in all_tests if t.score < HEALTHY_THRESHOLD)

    # Intervalo médio entre testes
    if len(all_tests) >= 2:
        intervals = []
        for i in range(1, len(all_tests)):
            interval = (all_tests[i].execution_date - all_tests[i - 1].execution_date).days
            intervals.append(interval)
        avg_interval = sum(intervals) / len(intervals)
    else:
        avg_interval = None

    return PatientTestStatistics(
        total_tests=total_tests,
        total_spiral_tests=total_spiral,
        total_voice_tests=total_voice,
        avg_spiral_score=avg_spiral,
        avg_voice_score=avg_voice,
        last_test_date=last_test_date,
        days_since_last_test=days_since_last,
        first_test_date=first_test_date,
        trend=trend,
        trend_percentage=trend_percentage,
        best_spiral_score=best_spiral,
        worst_spiral_score=worst_spiral,
        best_voice_score=best_voice,
        worst_voice_score=worst_voice,
        healthy_classification_count=healthy_count,
        parkinson_classification_count=parkinson_count,
        avg_test_interval_days=avg_interval,
    )


def get_patient_test_statistics(
    session: Session, doctor: User, patient_id: int
) -> PatientTestStatistics:
    """
    Retorna estatísticas agregadas dos testes de um paciente.
    Inclui tendência calculada por regressão linear simples.
    """
    from datetime import datetime, timezone

    # Valida vínculo
    binds = get_user_active_binds(session, doctor)
    if not binds or patient_id not in [bind.patient_id for bind in binds]:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="Você não tem acesso a este paciente.",
        )

    # Busca todos os testes ordenados cronologicamente
    all_tests = (
        session.query(Test)
        .filter(Test.patient_id == patient_id)
        .order_by(Test.execution_date)
        .all()
    )

    if not all_tests:
        return PatientTestStatistics(
            total_tests=0,
            total_spiral_tests=0,
            total_voice_tests=0,
            avg_spiral_score=None,
            avg_voice_score=None,
            last_test_date=None,
            days_since_last_test=None,
            first_test_date=None,
            trend="stable",
            trend_percentage=0.0,
            best_spiral_score=None,
            worst_spiral_score=None,
            best_voice_score=None,
            worst_voice_score=None,
            healthy_classification_count=0,
            parkinson_classification_count=0,
            avg_test_interval_days=None,
        )

    # Separar por tipo
    spiral_tests = [t for t in all_tests if t.test_type == TestType.SPIRAL_TEST]
    voice_tests = [t for t in all_tests if t.test_type == TestType.VOICE_TEST]

    # Calcular estatísticas básicas
    total_tests = len(all_tests)
    total_spiral = len(spiral_tests)
    total_voice = len(voice_tests)

    avg_spiral = (
        sum(t.score for t in spiral_tests) / total_spiral if total_spiral > 0 else None
    )
    avg_voice = sum(t.score for t in voice_tests) / total_voice if total_voice > 0 else None

    # Último teste
    last_test = all_tests[-1]
    last_test_date = last_test.execution_date
    days_since_last = (datetime.now(timezone.utc) - last_test_date).days

    # Primeiro teste
    first_test_date = all_tests[0].execution_date

    # Calcular tendência (regressão linear simples - sem numpy)
    scores = [t.score for t in all_tests]
    if len(scores) >= 2:
        n = len(scores)
        x = list(range(n))
        y = scores

        # Cálculo manual de regressão linear: y = mx + b
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(x[i] * y[i] for i in range(n))
        sum_x2 = sum(xi**2 for xi in x)

        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x**2)

        if slope > 0.01:
            trend = "improving"
        elif slope < -0.01:
            trend = "worsening"
        else:
            trend = "stable"

        trend_percentage = (slope * n) * 100 if n > 1 else 0.0
    else:
        trend = "stable"
        trend_percentage = 0.0

    # Melhores e piores scores
    best_spiral = max((t.score for t in spiral_tests), default=None)
    worst_spiral = min((t.score for t in spiral_tests), default=None)
    best_voice = max((t.score for t in voice_tests), default=None)
    worst_voice = min((t.score for t in voice_tests), default=None)

    # Classificações
    healthy_count = sum(1 for t in all_tests if t.score >= HEALTHY_THRESHOLD)
    parkinson_count = sum(1 for t in all_tests if t.score < HEALTHY_THRESHOLD)

    # Intervalo médio entre testes
    if len(all_tests) >= 2:
        intervals = []
        for i in range(1, len(all_tests)):
            interval = (all_tests[i].execution_date - all_tests[i - 1].execution_date).days
            intervals.append(interval)
        avg_interval = sum(intervals) / len(intervals)
    else:
        avg_interval = None

    return PatientTestStatistics(
        total_tests=total_tests,
        total_spiral_tests=total_spiral,
        total_voice_tests=total_voice,
        avg_spiral_score=avg_spiral,
        avg_voice_score=avg_voice,
        last_test_date=last_test_date,
        days_since_last_test=days_since_last,
        first_test_date=first_test_date,
        trend=trend,
        trend_percentage=trend_percentage,
        best_spiral_score=best_spiral,
        worst_spiral_score=worst_spiral,
        best_voice_score=best_voice,
        worst_voice_score=worst_voice,
        healthy_classification_count=healthy_count,
        parkinson_classification_count=parkinson_count,
        avg_test_interval_days=avg_interval,
    )


def get_patient_test_timeline(
    session: Session, doctor: User, patient_id: int
) -> PatientTestTimeline:
    """
    Retorna timeline completa de testes de um paciente ordenada cronologicamente.
    Inclui dados completos de cada teste para visualização e gráficos.
    """
    from sqlalchemy import desc

    # Valida vínculo
    binds = get_user_active_binds(session, doctor)
    if not binds or patient_id not in [bind.patient_id for bind in binds]:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="Você não tem acesso a este paciente.",
        )

    # Busca todos os testes ordenados cronologicamente (mais recente primeiro)
    all_tests = (
        session.query(Test)
        .filter(Test.patient_id == patient_id)
        .order_by(desc(Test.execution_date))
        .all()
    )

    timeline_items = []

    for test in all_tests:
        classification = "HEALTHY" if test.score >= HEALTHY_THRESHOLD else "PARKINSON"

        # Campos base
        item_data = {
            "test_id": test.id,
            "test_type": test.test_type,
            "execution_date": test.execution_date,
            "score": test.score,
            "classification": classification,
        }

        # Adicionar campos específicos por tipo
        if test.test_type == TestType.SPIRAL_TEST:
            spiral_test = session.query(SpiralTest).filter(SpiralTest.id == test.id).first()
            if spiral_test:
                item_data["draw_duration"] = spiral_test.draw_duration
                item_data["method"] = spiral_test.method
                item_data["majority_decision"] = classification

        elif test.test_type == TestType.VOICE_TEST:
            voice_test = session.query(VoiceTest).filter(VoiceTest.id == test.id).first()
            if voice_test:
                item_data["record_duration"] = voice_test.record_duration
                item_data["analysis"] = f"Score de {test.score:.2f} indica {classification}"

        timeline_items.append(TimelineTestItem(**item_data))

    return PatientTestTimeline(tests=timeline_items, total_count=len(timeline_items))


def get_test_detail(
    session: Session, doctor: User, test_id: int
) -> SpiralTestDetail | VoiceTestDetail:
    """
    Busca os detalhes completos de um teste individual.
    Retorna informações do teste e do paciente.

    Args:
        session: Sessão do banco de dados
        doctor: Médico logado
        test_id: ID do teste a ser buscado

    Returns:
        SpiralTestDetail ou VoiceTestDetail com informações completas

    Raises:
        HTTPException: Se teste não existe ou médico não tem acesso
    """
    from sqlalchemy.orm import joinedload

    # Buscar o teste com joinedload do patient
    test = (
        session.query(Test)
        .options(joinedload(Test.patient))
        .filter(Test.id == test_id)
        .first()
    )

    if not test:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Teste não encontrado."
        )

    # Validar se o médico tem acesso ao paciente
    binds = get_user_active_binds(session, doctor)
    if not binds or test.patient_id not in [bind.patient_id for bind in binds]:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN, detail="Você não tem acesso a este teste."
        )

    # Calcular classificação
    classification = "HEALTHY" if test.score >= HEALTHY_THRESHOLD else "PARKINSON"

    # Buscar dados específicos por tipo e retornar
    if test.test_type == TestType.SPIRAL_TEST:
        spiral_test = (
            session.query(SpiralTest)
            .options(joinedload(SpiralTest.patient))
            .filter(SpiralTest.id == test_id)
            .first()
        )

        if not spiral_test:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND,
                detail="Detalhes do teste de espiral não encontrados.",
            )

        return SpiralTestDetail(
            id=spiral_test.id,
            test_type=spiral_test.test_type,
            execution_date=spiral_test.execution_date,
            score=spiral_test.score,
            patient_id=spiral_test.patient_id,
            draw_duration=spiral_test.draw_duration,
            method=spiral_test.method,
            patient=spiral_test.patient,
            classification=classification,
        )

    elif test.test_type == TestType.VOICE_TEST:
        voice_test = (
            session.query(VoiceTest)
            .options(joinedload(VoiceTest.patient))
            .filter(VoiceTest.id == test_id)
            .first()
        )

        if not voice_test:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND,
                detail="Detalhes do teste de voz não encontrados.",
            )

        return VoiceTestDetail(
            id=voice_test.id,
            test_type=voice_test.test_type,
            execution_date=voice_test.execution_date,
            score=voice_test.score,
            patient_id=voice_test.patient_id,
            record_duration=voice_test.record_duration,
            patient=voice_test.patient,
            classification=classification,
        )

    else:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST, detail="Tipo de teste desconhecido."
        )


# Funções para pacientes visualizarem seus próprios testes


def get_my_tests_timeline(session: Session, patient: User) -> PatientTestTimeline:
    """
    Retorna timeline completa de testes do próprio paciente ordenada cronologicamente.
    Paciente visualiza seus próprios testes sem necessidade de validação de vínculos.
    """
    from sqlalchemy import desc

    # Busca todos os testes do paciente ordenados cronologicamente (mais recente primeiro)
    all_tests = (
        session.query(Test)
        .filter(Test.patient_id == patient.id)
        .order_by(desc(Test.execution_date))
        .all()
    )

    timeline_items = []

    for test in all_tests:
        classification = "HEALTHY" if test.score >= HEALTHY_THRESHOLD else "PARKINSON"

        # Campos base
        item_data = {
            "test_id": test.id,
            "test_type": test.test_type,
            "execution_date": test.execution_date,
            "score": test.score,
            "classification": classification,
        }

        # Adicionar campos específicos por tipo
        if test.test_type == TestType.SPIRAL_TEST:
            spiral_test = session.query(SpiralTest).filter(SpiralTest.id == test.id).first()
            if spiral_test:
                item_data["draw_duration"] = spiral_test.draw_duration
                item_data["method"] = spiral_test.method
                item_data["majority_decision"] = classification

        elif test.test_type == TestType.VOICE_TEST:
            voice_test = session.query(VoiceTest).filter(VoiceTest.id == test.id).first()
            if voice_test:
                item_data["record_duration"] = voice_test.record_duration
                item_data["analysis"] = f"Score de {test.score:.2f} indica {classification}"

        timeline_items.append(TimelineTestItem(**item_data))

    return PatientTestTimeline(tests=timeline_items, total_count=len(timeline_items))


def get_my_test_detail(
    session: Session, patient: User, test_id: int
) -> SpiralTestDetail | VoiceTestDetail:
    """
    Busca os detalhes completos de um teste individual do próprio paciente.
    Retorna informações do teste.

    Args:
        session: Sessão do banco de dados
        patient: Paciente logado
        test_id: ID do teste a ser buscado

    Returns:
        SpiralTestDetail ou VoiceTestDetail com informações completas

    Raises:
        HTTPException: Se teste não existe ou não pertence ao paciente
    """
    from sqlalchemy.orm import joinedload

    # Buscar o teste
    test = session.query(Test).filter(Test.id == test_id).first()

    if not test:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Teste não encontrado."
        )

    # Validar se o teste pertence ao paciente
    if test.patient_id != patient.id:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN, detail="Você não tem acesso a este teste."
        )

    # Calcular classificação
    classification = "HEALTHY" if test.score >= HEALTHY_THRESHOLD else "PARKINSON"

    # Buscar dados específicos por tipo e retornar
    if test.test_type == TestType.SPIRAL_TEST:
        spiral_test = (
            session.query(SpiralTest)
            .options(joinedload(SpiralTest.patient))
            .filter(SpiralTest.id == test_id)
            .first()
        )

        if not spiral_test:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND,
                detail="Detalhes do teste de espiral não encontrados.",
            )

        return SpiralTestDetail(
            id=spiral_test.id,
            test_type=spiral_test.test_type,
            execution_date=spiral_test.execution_date,
            score=spiral_test.score,
            patient_id=spiral_test.patient_id,
            draw_duration=spiral_test.draw_duration,
            method=spiral_test.method,
            patient=spiral_test.patient,
            classification=classification,
        )

    elif test.test_type == TestType.VOICE_TEST:
        voice_test = (
            session.query(VoiceTest)
            .options(joinedload(VoiceTest.patient))
            .filter(VoiceTest.id == test_id)
            .first()
        )

        if not voice_test:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND,
                detail="Detalhes do teste de voz não encontrados.",
            )

        return VoiceTestDetail(
            id=voice_test.id,
            test_type=voice_test.test_type,
            execution_date=voice_test.execution_date,
            score=voice_test.score,
            patient_id=voice_test.patient_id,
            record_duration=voice_test.record_duration,
            patient=voice_test.patient,
            classification=classification,
        )

    else:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST, detail="Tipo de teste desconhecido."
        )


# Funções para recuperar mídias (imagens e áudios) dos testes


def get_spiral_image(session: Session, doctor: User, test_id: int) -> tuple[bytes, str, str]:
    """
    Recupera a imagem de um teste de espiral.

    Args:
        session: Sessão do banco de dados
        doctor: Médico logado
        test_id: ID do teste

    Returns:
        tuple: (image_data, filename, content_type)

    Raises:
        HTTPException: Se teste não existe, não é espiral, médico não tem acesso, ou imagem não disponível
    """
    # Buscar o teste
    test = session.query(Test).filter(Test.id == test_id).first()

    if not test:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Teste não encontrado."
        )

    # Validar se o médico tem acesso ao paciente
    binds = get_user_active_binds(session, doctor)
    if not binds or test.patient_id not in [bind.patient_id for bind in binds]:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN, detail="Você não tem acesso a este teste."
        )

    # Verificar se é um teste de espiral
    if test.test_type != TestType.SPIRAL_TEST:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="Este teste não é um teste de espiral.",
        )

    # Buscar o teste de espiral
    spiral_test = session.query(SpiralTest).filter(SpiralTest.id == test_id).first()

    if not spiral_test or not spiral_test.spiral_image_data:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Imagem não disponível para este teste.",
        )

    return (
        spiral_test.spiral_image_data,
        spiral_test.spiral_image_filename or "spiral.png",
        spiral_test.spiral_image_content_type or "image/png",
    )


def get_voice_audio(session: Session, doctor: User, test_id: int) -> tuple[bytes, str, str]:
    """
    Recupera o áudio de um teste de voz.

    Args:
        session: Sessão do banco de dados
        doctor: Médico logado
        test_id: ID do teste

    Returns:
        tuple: (audio_data, filename, content_type)

    Raises:
        HTTPException: Se teste não existe, não é voz, médico não tem acesso, ou áudio não disponível
    """
    # Buscar o teste
    test = session.query(Test).filter(Test.id == test_id).first()

    if not test:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Teste não encontrado."
        )

    # Validar se o médico tem acesso ao paciente
    binds = get_user_active_binds(session, doctor)
    if not binds or test.patient_id not in [bind.patient_id for bind in binds]:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN, detail="Você não tem acesso a este teste."
        )

    # Verificar se é um teste de voz
    if test.test_type != TestType.VOICE_TEST:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST, detail="Este teste não é um teste de voz."
        )

    # Buscar o teste de voz
    voice_test = session.query(VoiceTest).filter(VoiceTest.id == test_id).first()

    if not voice_test or not voice_test.voice_audio_data:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Áudio não disponível para este teste.",
        )

    return (
        voice_test.voice_audio_data,
        voice_test.voice_audio_filename or "voice.webm",
        voice_test.voice_audio_content_type or "audio/webm",
    )


def get_my_spiral_image(session: Session, patient: User, test_id: int) -> tuple[bytes, str, str]:
    """
    Recupera a imagem de um teste de espiral do próprio paciente.

    Args:
        session: Sessão do banco de dados
        patient: Paciente logado
        test_id: ID do teste

    Returns:
        tuple: (image_data, filename, content_type)

    Raises:
        HTTPException: Se teste não existe, não pertence ao paciente, não é espiral, ou imagem não disponível
    """
    # Buscar o teste
    test = session.query(Test).filter(Test.id == test_id).first()

    if not test:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Teste não encontrado."
        )

    # Validar se o teste pertence ao paciente
    if test.patient_id != patient.id:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN, detail="Você não tem acesso a este teste."
        )

    # Verificar se é um teste de espiral
    if test.test_type != TestType.SPIRAL_TEST:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="Este teste não é um teste de espiral.",
        )

    # Buscar o teste de espiral
    spiral_test = session.query(SpiralTest).filter(SpiralTest.id == test_id).first()

    if not spiral_test or not spiral_test.spiral_image_data:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Imagem não disponível para este teste.",
        )

    return (
        spiral_test.spiral_image_data,
        spiral_test.spiral_image_filename or "spiral.png",
        spiral_test.spiral_image_content_type or "image/png",
    )


def get_my_voice_audio(session: Session, patient: User, test_id: int) -> tuple[bytes, str, str]:
    """
    Recupera o áudio de um teste de voz do próprio paciente.

    Args:
        session: Sessão do banco de dados
        patient: Paciente logado
        test_id: ID do teste

    Returns:
        tuple: (audio_data, filename, content_type)

    Raises:
        HTTPException: Se teste não existe, não pertence ao paciente, não é voz, ou áudio não disponível
    """
    # Buscar o teste
    test = session.query(Test).filter(Test.id == test_id).first()

    if not test:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Teste não encontrado."
        )

    # Validar se o teste pertence ao paciente
    if test.patient_id != patient.id:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN, detail="Você não tem acesso a este teste."
        )

    # Verificar se é um teste de voz
    if test.test_type != TestType.VOICE_TEST:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST, detail="Este teste não é um teste de voz."
        )

    # Buscar o teste de voz
    voice_test = session.query(VoiceTest).filter(VoiceTest.id == test_id).first()

    if not voice_test or not voice_test.voice_audio_data:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Áudio não disponível para este teste.",
        )

    return (
        voice_test.voice_audio_data,
        voice_test.voice_audio_filename or "voice.webm",
        voice_test.voice_audio_content_type or "audio/webm",
    )
