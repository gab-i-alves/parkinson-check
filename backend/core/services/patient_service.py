from datetime import date
from http import HTTPStatus

from fastapi import HTTPException
from sqlalchemy import or_, func, desc
from sqlalchemy.orm import Session

from api.schemas.binding import RequestBinding
from api.schemas.users import (
    AddressResponse,
    GetPatientsSchema,
    PatientDashboardResponse,
    PatientFullProfileResponse,
    PatientListResponse,
    PatientSchema,
)
from core.models import Bind, Doctor, Patient, Test, User
from core.security.security import get_password_hash
from core.services import address_service, user_service, notification_service
from core.services.user_service import get_binded_users

from ..enums import BindEnum, TestType, UserType


def create_patient(patient: PatientSchema, session: Session, confirmation_email = True):
    if user_service.get_user_by_email(patient.email, session) is not None:
        raise HTTPException(
            HTTPStatus.CONFLICT, detail="Já existe um usuário com o email informado."
        )

    if user_service.get_user_by_cpf(patient.cpf, session) is not None:
        raise HTTPException(HTTPStatus.CONFLICT, detail="O CPF informado já está em uso.")

    address = address_service.get_similar_address(
        patient.cep, patient.number, patient.complement, session
    )

    if address is None:
        address_service.create_address(
            patient.cep,
            patient.street,
            patient.number,
            patient.complement,
            patient.neighborhood,
            patient.city,
            patient.state,
            session,
        )
        address = address_service.get_similar_address(
            patient.cep, patient.number, patient.complement, session
        )

    db_patient = Patient(
        name=patient.fullname,
        cpf=patient.cpf,
        email=patient.email,
        hashed_password=get_password_hash(patient.password),
        birthdate=patient.birthdate,
        user_type=UserType.PATIENT,
        address_id=address.id,
        is_active=True #TODO ativação da conta pelo email de confirmação
    )

    session.add(db_patient)
    session.commit()
    session.refresh(db_patient)
    return db_patient


def create_bind_request(request: RequestBinding, user: User, session: Session) -> Bind:
    active_or_pending_bind = (
        session.query(Bind)
        .filter(
            Bind.doctor_id == request.doctor_id,
            Bind.patient_id == user.id,
            or_(Bind.status == BindEnum.PENDING, Bind.status == BindEnum.ACTIVE),
        )
        .first()
    )

    if active_or_pending_bind:
        raise HTTPException(
            HTTPStatus.CONFLICT, detail="Uma solicitação já está ativa ou pendente."
        )

    inactive_bind = (
        session.query(Bind)
        .filter(
            Bind.doctor_id == request.doctor_id,
            Bind.patient_id == user.id,
            or_(Bind.status == BindEnum.REJECTED, Bind.status == BindEnum.REVERSED),
        )
        .first()
    )

    if inactive_bind:
        inactive_bind.status = BindEnum.PENDING
        db_bind = inactive_bind
    else:
        doctor = session.query(Doctor).filter(Doctor.id == request.doctor_id).first()
        if not doctor:
            raise HTTPException(
                HTTPStatus.NOT_FOUND, detail="O médico do ID informado não existe."
            )

        db_bind = Bind(
            doctor_id=request.doctor_id, patient_id=user.id, status=BindEnum.PENDING
        )

    session.add(db_bind)
    session.commit()
    session.refresh(db_bind)
    return db_bind


def unlink_binding(binding_id: int, user: User, session: Session) -> Bind:
    """
    Altera o status de um link para REVERSED, desvinculando o paciente.
    """

    bind_to_unlink = session.query(Bind).filter_by(id=binding_id).first()

    if not bind_to_unlink:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Vínculo não encontrado."
        )

    if bind_to_unlink.patient_id != user.id:
        raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Ação não permitida.")

    bind_to_unlink.status = BindEnum.REVERSED
    session.add(bind_to_unlink)
    session.commit()
    session.refresh(bind_to_unlink)

    return bind_to_unlink


def get_binded_patients(session: Session, current_user: User) -> list[PatientListResponse]:
    """
    Com base em um usuário retorna os pacientes vinculados a ele.
    Formato de lista (PatientListResponse)
    """
    binded_patients = get_binded_users(current_user, session)

    patient_list = []

    for item in binded_patients:
        patient = item["user"]
        bind_id = item["bind_id"]

        # Calcula idade
        age = calculate_age(patient.birthdate)

        # Busca últimos testes para calcular status
        recent_tests = (
            session.query(Test)
            .filter(Test.patient_id == patient.id)
            .order_by(desc(Test.execution_date))
            .limit(5)
            .all()
        )
        recent_scores = [test.score for test in recent_tests]
        status = calculate_patient_status(recent_scores)

        patient_list.append(
            PatientListResponse(
                id=patient.id,
                name=patient.name,
                cpf=patient.cpf,
                email=patient.email,
                location=f"{patient.address.city}, {patient.address.state}",
                role=UserType.PATIENT,
                bind_id=bind_id,
                age=age,
                status=status,
            )
        )
    return patient_list


def calculate_age(birthdate: date) -> int:
    """Calcula idade a partir da data de nascimento"""
    today = date.today()
    age = (
        today.year
        - birthdate.year
        - ((today.month, today.day) < (birthdate.month, birthdate.day))
    )
    return age


def calculate_patient_status(recent_scores: list[float]) -> str:
    """
    Calcula o status do paciente baseado nos scores recentes.
    - stable: média >= 0.7
    - attention: 0.4 <= média < 0.7
    - critical: média < 0.4
    """
    if not recent_scores:
        return "stable"

    avg_score = sum(recent_scores) / len(recent_scores)

    if avg_score >= 0.7:
        return "stable"
    elif avg_score >= 0.4:
        return "attention"
    else:
        return "critical"


def get_patients_dashboard_data(
    session: Session, current_user: User
) -> list[PatientDashboardResponse]:
    """
    Retorna dados completos dos pacientes vinculados para o dashboard do médico.
    Inclui informações de testes, idade, status, etc.
    """
    binded_patients = get_binded_users(current_user, session)

    dashboard_data = []

    for item in binded_patients:
        patient = item["user"]
        bind_id = item["bind_id"]

        # Calcula idade
        age = calculate_age(patient.birthdate)

        # Busca todos os testes do paciente
        all_tests = (
            session.query(Test)
            .filter(Test.patient_id == patient.id)
            .order_by(desc(Test.execution_date))
            .all()
        )

        tests_count = len(all_tests)

        # Busca último teste
        last_test = all_tests[0] if all_tests else None
        last_test_date = last_test.execution_date.isoformat() if last_test else None
        last_test_type = None

        if last_test:
            if last_test.test_type == TestType.SPIRAL_TEST:
                last_test_type = "spiral"
            elif last_test.test_type == TestType.VOICE_TEST:
                last_test_type = "voice"

        # Calcula status baseado nos últimos 5 testes
        recent_scores = [test.score for test in all_tests[:5]]
        status = calculate_patient_status(recent_scores)

        dashboard_data.append(
            PatientDashboardResponse(
                id=patient.id,
                name=patient.name,
                cpf=patient.cpf,
                email=patient.email,
                age=age,
                status=status,
                last_test_date=last_test_date,
                last_test_type=last_test_type,
                tests_count=tests_count,
                bind_id=bind_id,
            )
        )

    return dashboard_data


def get_patient_full_profile(
    session: Session, doctor: User, patient_id: int
) -> PatientFullProfileResponse:
    """
    Retorna perfil completo do paciente incluindo endereço e informações pessoais.
    Validação: médico deve ter vínculo ativo com o paciente.
    """
    from core.services.user_service import get_user_active_binds

    # Valida vínculo
    binds = get_user_active_binds(session, doctor)
    if not binds or patient_id not in [bind.patient_id for bind in binds]:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="Você não tem acesso a este paciente.",
        )

    # Busca paciente com endereço
    patient = session.query(Patient).filter(Patient.id == patient_id).first()

    if not patient:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Paciente não encontrado.",
        )

    # Calcula idade
    age = calculate_age(patient.birthdate)

    # Busca testes para calcular status
    recent_tests = (
        session.query(Test)
        .filter(Test.patient_id == patient_id)
        .order_by(desc(Test.execution_date))
        .limit(5)
        .all()
    )
    recent_scores = [test.score for test in recent_tests]
    status = calculate_patient_status(recent_scores)

    # Busca bind para pegar data de criação
    bind = next((b for b in binds if b.patient_id == patient_id), None)

    return PatientFullProfileResponse(
        id=patient.id,
        name=patient.name,
        cpf=patient.cpf,
        email=patient.email,
        birthdate=patient.birthdate,
        age=age,
        address=AddressResponse(
            street=patient.address.street,
            number=patient.address.number,
            complement=patient.address.complement,
            neighborhood=patient.address.neighborhood,
            city=patient.address.city,
            state=patient.address.state,
            cep=patient.address.cep,
        ),
        status=status,
        bind_id=bind.id if bind else 0,
        created_at=None,  # TODO: Adicionar data de criação no modelo Bind
    )


def get_patients(session: Session, doctor: User, parameters: GetPatientsSchema) -> list[PatientListResponse]:
    """
    Busca todos os pacientes do sistema, excluindo os já vinculados ao médico atual.
    Médicos podem usar filtros: name, cpf, email, status.
    """
    from sqlalchemy.orm import joinedload
    from core.services.user_service import get_user_active_binds

    # Busca vínculos ativos do médico para excluir pacientes já vinculados
    active_binds = get_user_active_binds(session, doctor)
    linked_patient_ids = [bind.patient_id for bind in active_binds] if active_binds else []

    # Query base de pacientes
    patient_query = session.query(Patient).options(joinedload(Patient.address))

    # Excluir pacientes já vinculados
    if linked_patient_ids:
        patient_query = patient_query.filter(Patient.id.not_in(linked_patient_ids))

    # Aplicar filtros opcionais com busca parcial (fuzzy search)
    if parameters.name:
        patient_query = patient_query.filter(Patient.name.ilike(f'%{parameters.name}%'))

    if parameters.cpf:
        patient_query = patient_query.filter(Patient.cpf.ilike(f'%{parameters.cpf}%'))

    if parameters.email:
        patient_query = patient_query.filter(Patient.email.ilike(f'%{parameters.email}%'))

    patients = patient_query.all()

    patient_list = []

    if not patients:
        return patient_list

    for patient in patients:
        # Calcula idade
        age = calculate_age(patient.birthdate)

        # Busca últimos testes para calcular status
        recent_tests = (
            session.query(Test)
            .filter(Test.patient_id == patient.id)
            .order_by(desc(Test.execution_date))
            .limit(5)
            .all()
        )
        recent_scores = [test.score for test in recent_tests]
        status = calculate_patient_status(recent_scores)

        # Aplicar filtro de status se fornecido
        if parameters.status and status != parameters.status:
            continue

        patient_list.append(
            PatientListResponse(
                id=patient.id,
                name=patient.name,
                cpf=patient.cpf,
                email=patient.email,
                location=f"{patient.address.city}, {patient.address.state}",
                role=UserType.PATIENT,
                bind_id=None,
                age=age,
                status=status,
            )
        )

    return patient_list


def get_privacy_settings(session: Session, user: User):
    """
    Retorna as configurações de privacidade do paciente.
    """
    from api.schemas.user_settings import PrivacySettingsResponse

    patient = session.query(Patient).filter(Patient.id == user.id).first()

    if not patient:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Paciente não encontrado"
        )

    return PrivacySettingsResponse(
        share_data_for_statistics=patient.share_data_for_statistics
    )


def update_privacy_settings(session: Session, user: User, settings):
    """
    Atualiza as configurações de privacidade do paciente.
    """
    patient = session.query(Patient).filter(Patient.id == user.id).first()

    if not patient:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Paciente não encontrado"
        )

    patient.share_data_for_statistics = settings.share_data_for_statistics
    session.commit()

