from datetime import date, datetime
from unittest.mock import MagicMock

import pytest
from faker import Faker

from core.enums import BindEnum, UserType
from core.models import Address, Bind, Doctor, Patient, SpiralTest, User, VoiceTest

fake = Faker("pt_BR")


@pytest.fixture
def mock_session():
    """Mock de SQLAlchemy Session para testes isolados."""
    session = MagicMock()
    return session


@pytest.fixture
def sample_address():
    """Fixture para criar um endereço de exemplo."""
    address = Address(
        cep="12345-678",
        street="Rua Exemplo",
        number="123",
        complement="Apto 101",
        neighborhood="Centro",
        city="São Paulo",
        state="SP",
    )
    address.id = 1
    return address


@pytest.fixture
def sample_user(sample_address):
    """Fixture para criar um usuário base."""
    user = User(
        name="João Silva",
        cpf="12345678901",
        email="joao@example.com",
        birthdate=date(1990, 1, 1),
        hashed_password="$argon2id$v=19$m=65536,t=3,p=4$hashed_password",
        user_type=UserType.PATIENT,
        address_id=sample_address.id,
    )
    user.id = 1
    user.address = sample_address
    return user


@pytest.fixture
def sample_doctor(sample_address):
    """Fixture para criar um médico de exemplo."""
    doctor = Doctor(
        name="Dra. Maria Santos",
        cpf="98765432100",
        email="maria@example.com",
        birthdate=date(1985, 5, 15),
        hashed_password="$argon2id$v=19$m=65536,t=3,p=4$hashed_password",
        user_type=UserType.DOCTOR,
        address_id=sample_address.id,
        crm="123456",
        expertise_area="Neurologia",
        status_approval=True,
    )
    doctor.id = 2
    doctor.address = sample_address
    return doctor


@pytest.fixture
def sample_patient(sample_address):
    """Fixture para criar um paciente de exemplo."""
    patient = Patient(
        name="Carlos Oliveira",
        cpf="11122233344",
        email="carlos@example.com",
        birthdate=date(1995, 3, 20),
        hashed_password="$argon2id$v=19$m=65536,t=3,p=4$hashed_password",
        user_type=UserType.PATIENT,
        address_id=sample_address.id,
    )
    patient.id = 3
    patient.address = sample_address
    return patient


@pytest.fixture
def sample_bind(sample_doctor, sample_patient):
    """Fixture para criar um vínculo (bind) de exemplo."""
    bind = Bind(
        doctor_id=sample_doctor.id,
        patient_id=sample_patient.id,
        status=BindEnum.ACTIVE,
    )
    bind.id = 1
    return bind


@pytest.fixture
def sample_voice_test(sample_patient):
    """Fixture para criar um teste de voz de exemplo."""
    from core.enums import TestStatus, TestType

    # Create base Test attributes first
    test = VoiceTest(
        test_type=TestType.VOICE_TEST,
        status=TestStatus.DONE,
        score=0.75,
        patient_id=sample_patient.id,
        record_duration=5.5,
    )
    test.id = 1
    test.execution_date = datetime.now().date()
    return test


@pytest.fixture
def sample_spiral_test(sample_patient):
    """Fixture para criar um teste de espiral de exemplo."""
    from core.enums import SpiralMethods, TestStatus, TestType

    test = SpiralTest(
        test_type=TestType.SPIRAL_TEST,
        status=TestStatus.DONE,
        score=0.82,
        patient_id=sample_patient.id,
        draw_duration=12.3,
        method=SpiralMethods.PAPER,
    )
    test.id = 2
    test.execution_date = datetime.now().date()
    return test


@pytest.fixture
def multiple_binds(sample_doctor, sample_patient):
    """Fixture para criar múltiplos binds com diferentes status."""
    bind1 = Bind(
        doctor_id=sample_doctor.id, patient_id=sample_patient.id, status=BindEnum.ACTIVE
    )
    bind1.id = 1

    bind2 = Bind(
        doctor_id=sample_doctor.id, patient_id=sample_patient.id, status=BindEnum.PENDING
    )
    bind2.id = 2

    bind3 = Bind(
        doctor_id=sample_doctor.id, patient_id=sample_patient.id, status=BindEnum.REJECTED
    )
    bind3.id = 3

    return [bind1, bind2, bind3]
