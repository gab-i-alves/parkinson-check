from datetime import date, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from api.schemas.statistics import (
    ComparativeStatistics,
    GenderAverages,
    PatientDemographics,
    RegionalAverages,
)
from core.models.address import Address
from core.models.tests import Test
from core.models.users import Patient, User


def calculate_age(birthdate: date) -> int:
    """Calcula idade a partir da data de nascimento"""
    today = date.today()
    return today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))


def get_age_group(age: int) -> str:
    """Retorna a faixa etária baseada na idade"""
    if age <= 40:
        return "0-40"
    elif age <= 60:
        return "41-60"
    elif age <= 75:
        return "61-75"
    else:
        return "76+"


def infer_gender(cpf: str) -> str:
    """
    Infere o gênero com base no dígito do CPF (simplificação).
    Em um sistema real, seria melhor ter um campo explícito de gênero.
    Por enquanto, usando uma heurística baseada no penúltimo dígito:
    - Par: feminino
    - Ímpar: masculino
    """
    # Remover caracteres não numéricos
    cpf_digits = "".join(filter(str.isdigit, cpf))
    if len(cpf_digits) >= 11:
        # Penúltimo dígito do CPF
        penultimate_digit = int(cpf_digits[-2])
        return "female" if penultimate_digit % 2 == 0 else "male"
    return "male"  # Default


def get_comparative_statistics(session: Session, user: User) -> ComparativeStatistics:
    """
    Calcula estatísticas comparativas para um paciente.

    Compara o desempenho do paciente com médias do sistema, filtrando apenas
    pacientes que optaram por compartilhar dados (share_data_for_statistics=True).
    """
    # Buscar informações do paciente com endereço
    patient = session.scalar(
        select(Patient)
        .options(joinedload(Patient.address))
        .where(Patient.id == user.id)
    )

    if not patient:
        raise ValueError("Patient not found")

    # Calcular informações demográficas do paciente
    patient_age = calculate_age(patient.birthdate)
    patient_age_group = get_age_group(patient_age)
    patient_gender = infer_gender(patient.cpf)

    # Calcular score médio do paciente
    patient_avg_query = select(func.avg(Test.score)).where(Test.patient_id == patient.id)
    patient_avg_score = session.scalar(patient_avg_query) or 0.0

    # --- Estatísticas Globais ---

    # Query base: apenas pacientes que compartilham dados
    sharing_patients_query = select(Patient.id).where(
        Patient.share_data_for_statistics == True
    )

    sharing_patient_ids = session.scalars(sharing_patients_query).all()

    # Contar total de pacientes
    total_patients_in_system = session.scalar(select(func.count(Patient.id))) or 0
    total_patients_sharing_data = len(sharing_patient_ids)

    # Média global (todos os pacientes que compartilham dados)
    global_avg_query = (
        select(func.avg(Test.score))
        .where(Test.patient_id.in_(sharing_patient_ids))
    )
    global_avg_score = session.scalar(global_avg_query)

    # --- Estatísticas por Faixa Etária ---

    # Encontrar pacientes na mesma faixa etária
    age_group_patients = session.scalars(
        select(Patient.id)
        .where(Patient.id.in_(sharing_patient_ids))
    ).all()

    # Filtrar por idade calculada (precisamos fazer isso em Python)
    age_group_patient_ids = [
        p_id for p_id in age_group_patients
        if get_age_group(calculate_age(
            session.scalar(select(Patient.birthdate).where(Patient.id == p_id))
        )) == patient_age_group
    ]

    total_patients_in_age_group = len(age_group_patient_ids)

    # Média da faixa etária
    age_group_avg_query = (
        select(func.avg(Test.score))
        .where(Test.patient_id.in_(age_group_patient_ids))
    )
    age_group_avg_score = session.scalar(age_group_avg_query)

    # --- Estatísticas Regionais ---

    regional_avg = RegionalAverages()

    if patient.address:
        # Média por cidade
        city_patients = session.scalars(
            select(Patient.id)
            .join(Address, Patient.address_id == Address.id)
            .where(Patient.id.in_(sharing_patient_ids))
            .where(Address.city == patient.address.city)
        ).all()

        if city_patients:
            city_avg_query = (
                select(func.avg(Test.score))
                .where(Test.patient_id.in_(city_patients))
            )
            regional_avg.city = session.scalar(city_avg_query)

        # Média por estado
        state_patients = session.scalars(
            select(Patient.id)
            .join(Address, Patient.address_id == Address.id)
            .where(Patient.id.in_(sharing_patient_ids))
            .where(Address.state == patient.address.state)
        ).all()

        if state_patients:
            state_avg_query = (
                select(func.avg(Test.score))
                .where(Test.patient_id.in_(state_patients))
            )
            regional_avg.state = session.scalar(state_avg_query)

        # Média nacional (Brasil) - todos os pacientes compartilhando
        regional_avg.country = global_avg_score

    # --- Estatísticas por Gênero ---

    gender_avg = GenderAverages()

    # Filtrar pacientes por gênero (baseado no CPF)
    male_patients = [
        p_id for p_id in age_group_patient_ids
        if infer_gender(
            session.scalar(select(Patient.cpf).where(Patient.id == p_id))
        ) == "male"
    ]

    female_patients = [
        p_id for p_id in age_group_patient_ids
        if infer_gender(
            session.scalar(select(Patient.cpf).where(Patient.id == p_id))
        ) == "female"
    ]

    if male_patients:
        male_avg_query = (
            select(func.avg(Test.score))
            .where(Test.patient_id.in_(male_patients))
        )
        gender_avg.male = session.scalar(male_avg_query)

    if female_patients:
        female_avg_query = (
            select(func.avg(Test.score))
            .where(Test.patient_id.in_(female_patients))
        )
        gender_avg.female = session.scalar(female_avg_query)

    # --- Percentil do Paciente ---

    patient_percentile = None
    if sharing_patient_ids:
        # Calcular médias de todos os pacientes compartilhando dados (excluindo o paciente atual)
        all_averages = []
        for p_id in sharing_patient_ids:
            if p_id == patient.id:  # Pular o próprio paciente
                continue
            avg_query = select(func.avg(Test.score)).where(Test.patient_id == p_id)
            avg_score = session.scalar(avg_query)
            if avg_score is not None:
                all_averages.append(avg_score)

        if all_averages:
            # Calcular percentil (quantos pacientes têm score menor que o paciente atual)
            patients_below = sum(1 for avg in all_averages if avg < patient_avg_score)
            patient_percentile = (patients_below / len(all_averages)) * 100

    # --- Construir resposta ---

    demographics = PatientDemographics(
        age=patient_age,
        age_group=patient_age_group,
        gender=patient_gender,
        city=patient.address.city if patient.address else "N/A",
        state=patient.address.state if patient.address else "N/A",
        country="Brasil",
    )

    return ComparativeStatistics(
        patient_avg_score=float(patient_avg_score),
        global_avg_score=float(global_avg_score) if global_avg_score is not None else None,
        age_group_avg_score=float(age_group_avg_score) if age_group_avg_score is not None else None,
        regional_avg=regional_avg,
        gender_avg=gender_avg,
        patient_percentile=patient_percentile,
        demographics=demographics,
        total_patients_in_system=total_patients_in_system,
        total_patients_in_age_group=total_patients_in_age_group,
        total_patients_sharing_data=total_patients_sharing_data,
    )
