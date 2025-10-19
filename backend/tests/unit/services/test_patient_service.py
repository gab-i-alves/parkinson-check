from datetime import date
from http import HTTPStatus
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from api.schemas.binding import RequestBinding
from api.schemas.users import PatientSchema
from core.enums import BindEnum, UserType
from core.models import Bind
from core.services import patient_service


class TestPatientService:
    """Testes para o serviço de gerenciamento de pacientes."""

    def test_create_patient_success(self, mock_session, sample_address):
        """Testa criação de paciente com sucesso."""
        # Arrange
        patient_data = PatientSchema(
            fullname="Maria Oliveira",
            cpf="12345678901",
            email="maria@patient.com",
            password="senha123",
            birthdate=date(1990, 8, 20),
            cep="12345-678",
            street="Rua Paciente",
            number="200",
            complement="Apto 5",
            neighborhood="Centro",
            city="Rio de Janeiro",
            state="RJ",
        )

        with patch(
            "core.services.patient_service.user_service.get_user_by_email",
            return_value=None,
        ):
            with patch(
                "core.services.patient_service.user_service.get_user_by_cpf",
                return_value=None,
            ):
                with patch(
                    "core.services.patient_service.address_service.get_similar_address",
                    return_value=sample_address,
                ):
                    with patch(
                        "core.services.patient_service.get_password_hash",
                        return_value="hashed",
                    ):
                        # Act
                        result = patient_service.create_patient(patient_data, mock_session)

                        # Assert
                        assert result == patient_data
                        mock_session.add.assert_called_once()
                        mock_session.commit.assert_called_once()
                        mock_session.refresh.assert_called_once()

    def test_create_patient_duplicate_email(self, mock_session, sample_patient):
        """Testa criação de paciente com email duplicado."""
        # Arrange
        patient_data = PatientSchema(
            fullname="Outro Paciente",
            cpf="11111111111",
            email="carlos@example.com",
            password="senha123",
            birthdate=date(1995, 3, 20),
            cep="11111-111",
            street="Rua",
            number="10",
            complement=None,
            neighborhood="Bairro",
            city="São Paulo",
            state="SP",
        )

        with patch(
            "core.services.patient_service.user_service.get_user_by_email",
            return_value=sample_patient,
        ):
            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                patient_service.create_patient(patient_data, mock_session)

            assert exc_info.value.status_code == HTTPStatus.CONFLICT
            assert "Já existe um usuário com o email informado." in exc_info.value.detail

    def test_create_patient_duplicate_cpf(self, mock_session, sample_patient):
        """Testa criação de paciente com CPF duplicado."""
        # Arrange
        patient_data = PatientSchema(
            fullname="Outro Paciente",
            cpf="11122233344",
            email="novo@example.com",
            password="senha123",
            birthdate=date(1995, 3, 20),
            cep="11111-111",
            street="Rua",
            number="10",
            complement=None,
            neighborhood="Bairro",
            city="São Paulo",
            state="SP",
        )

        with patch(
            "core.services.patient_service.user_service.get_user_by_email",
            return_value=None,
        ):
            with patch(
                "core.services.patient_service.user_service.get_user_by_cpf",
                return_value=sample_patient,
            ):
                # Act & Assert
                with pytest.raises(HTTPException) as exc_info:
                    patient_service.create_patient(patient_data, mock_session)

                assert exc_info.value.status_code == HTTPStatus.CONFLICT
                assert "O CPF informado já está em uso." in exc_info.value.detail

    def test_create_bind_request_success(self, mock_session, sample_patient, sample_doctor):
        """Testa criação de solicitação de vínculo com sucesso."""
        # Arrange
        request = RequestBinding(doctor_id=sample_doctor.id)

        mock_query_bind = MagicMock()
        mock_query_bind.filter.return_value.first.return_value = None

        mock_query_doctor = MagicMock()
        mock_query_doctor.filter.return_value.first.return_value = sample_doctor

        mock_session.query.side_effect = [
            mock_query_bind,
            mock_query_bind,
            mock_query_doctor,
        ]

        # Act
        result = patient_service.create_bind_request(request, sample_patient, mock_session)

        # Assert
        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once()

    def test_create_bind_request_already_active(
        self, mock_session, sample_patient, sample_doctor
    ):
        """Testa criação de vínculo quando já existe um ativo."""
        # Arrange
        request = RequestBinding(doctor_id=sample_doctor.id)
        existing_bind = Bind(
            doctor_id=sample_doctor.id,
            patient_id=sample_patient.id,
            status=BindEnum.ACTIVE,
        )
        existing_bind.id = 1

        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = existing_bind
        mock_session.query.return_value = mock_query

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            patient_service.create_bind_request(request, sample_patient, mock_session)

        assert exc_info.value.status_code == HTTPStatus.CONFLICT
        assert "Uma solicitação já está ativa ou pendente." in exc_info.value.detail

    def test_create_bind_request_already_pending(
        self, mock_session, sample_patient, sample_doctor
    ):
        """Testa criação de vínculo quando já existe um pendente."""
        # Arrange
        request = RequestBinding(doctor_id=sample_doctor.id)
        existing_bind = Bind(
            doctor_id=sample_doctor.id,
            patient_id=sample_patient.id,
            status=BindEnum.PENDING,
        )
        existing_bind.id = 1

        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = existing_bind
        mock_session.query.return_value = mock_query

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            patient_service.create_bind_request(request, sample_patient, mock_session)

        assert exc_info.value.status_code == HTTPStatus.CONFLICT
        assert "Uma solicitação já está ativa ou pendente." in exc_info.value.detail

    def test_create_bind_request_reactivate_rejected(
        self, mock_session, sample_patient, sample_doctor
    ):
        """Testa reativação de vínculo rejeitado."""
        # Arrange
        request = RequestBinding(doctor_id=sample_doctor.id)
        rejected_bind = Bind(
            doctor_id=sample_doctor.id,
            patient_id=sample_patient.id,
            status=BindEnum.REJECTED,
        )
        rejected_bind.id = 1

        mock_query = MagicMock()
        mock_query.filter.return_value.first.side_effect = [None, rejected_bind]
        mock_session.query.return_value = mock_query

        # Act
        result = patient_service.create_bind_request(request, sample_patient, mock_session)

        # Assert
        assert rejected_bind.status == BindEnum.PENDING
        mock_session.add.assert_called_once_with(rejected_bind)
        mock_session.commit.assert_called_once()

    def test_create_bind_request_doctor_not_found(self, mock_session, sample_patient):
        """Testa criação de vínculo quando médico não existe."""
        # Arrange
        request = RequestBinding(doctor_id=999)

        mock_query_bind = MagicMock()
        mock_query_bind.filter.return_value.first.return_value = None

        mock_query_doctor = MagicMock()
        mock_query_doctor.filter.return_value.first.return_value = None

        mock_session.query.side_effect = [
            mock_query_bind,
            mock_query_bind,
            mock_query_doctor,
        ]

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            patient_service.create_bind_request(request, sample_patient, mock_session)

        assert exc_info.value.status_code == HTTPStatus.NOT_FOUND
        assert "O médico do ID informado não existe." in exc_info.value.detail

    def test_unlink_binding_success(self, mock_session, sample_patient):
        """Testa desvinculação bem-sucedida."""
        # Arrange
        bind = Bind(
            doctor_id=2,
            patient_id=sample_patient.id,
            status=BindEnum.ACTIVE,
        )
        bind.id = 1

        mock_query = MagicMock()
        mock_query.filter_by.return_value.first.return_value = bind
        mock_session.query.return_value = mock_query

        # Act
        result = patient_service.unlink_binding(1, sample_patient, mock_session)

        # Assert
        assert bind.status == BindEnum.REVERSED
        mock_session.add.assert_called_once_with(bind)
        mock_session.commit.assert_called_once()

    def test_unlink_binding_not_found(self, mock_session, sample_patient):
        """Testa desvinculação quando vínculo não existe."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter_by.return_value.first.return_value = None
        mock_session.query.return_value = mock_query

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            patient_service.unlink_binding(999, sample_patient, mock_session)

        assert exc_info.value.status_code == HTTPStatus.NOT_FOUND
        assert "Vínculo não encontrado." in exc_info.value.detail

    def test_unlink_binding_forbidden(self, mock_session, sample_patient):
        """Testa desvinculação quando paciente não é o dono do vínculo."""
        # Arrange
        bind = Bind(
            doctor_id=2,
            patient_id=999,  # ID diferente do sample_patient
            status=BindEnum.ACTIVE,
        )
        bind.id = 1

        mock_query = MagicMock()
        mock_query.filter_by.return_value.first.return_value = bind
        mock_session.query.return_value = mock_query

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            patient_service.unlink_binding(1, sample_patient, mock_session)

        assert exc_info.value.status_code == HTTPStatus.FORBIDDEN
        assert "Ação não permitida." in exc_info.value.detail

    def test_get_binded_patients(self, mock_session, sample_doctor, sample_patient):
        """Testa busca de pacientes vinculados a um médico."""
        # Arrange
        with patch("core.services.patient_service.get_binded_users") as mock_get_binded:
            mock_get_binded.return_value = [{"bind_id": 1, "user": sample_patient}]

            # Act
            result = patient_service.get_binded_patients(mock_session, sample_doctor)

            # Assert
            assert len(result) == 1
            assert result[0].id == sample_patient.id
            assert result[0].bind_id == 1
            assert result[0].role == UserType.PATIENT

    def test_create_patient_with_new_address(self, mock_session):
        """Testa criação de paciente quando endereço não existe."""
        # Arrange
        patient_data = PatientSchema(
            fullname="Ana Silva",
            cpf="99988877766",
            email="ana@patient.com",
            password="senha123",
            birthdate=date(1992, 4, 15),
            cep="88888-888",
            street="Av. Nova",
            number="300",
            complement="Bloco B",
            neighborhood="Centro",
            city="Porto Alegre",
            state="RS",
        )

        mock_address = MagicMock()
        mock_address.id = 20

        with patch(
            "core.services.patient_service.user_service.get_user_by_email",
            return_value=None,
        ):
            with patch(
                "core.services.patient_service.user_service.get_user_by_cpf",
                return_value=None,
            ):
                with patch(
                    "core.services.patient_service.address_service.get_similar_address",
                    side_effect=[None, mock_address],
                ):
                    with patch(
                        "core.services.patient_service.address_service.create_address"
                    ):
                        with patch(
                            "core.services.patient_service.get_password_hash",
                            return_value="hashed",
                        ):
                            # Act
                            result = patient_service.create_patient(
                                patient_data, mock_session
                            )

                            # Assert
                            assert result == patient_data
                            mock_session.add.assert_called_once()
                            mock_session.commit.assert_called_once()
