from datetime import date
from http import HTTPStatus
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from api.schemas.users import DoctorSchema, GetDoctorsSchema
from core.enums import BindEnum, UserType
from core.models import Bind, Doctor
from core.services import doctor_service


class TestDoctorService:
    """Testes para o serviço de gerenciamento de médicos."""

    def test_create_doctor_success(self, mock_session, sample_address):
        """Testa criação de médico com sucesso."""
        # Arrange
        doctor_data = DoctorSchema(
            fullname="Dr. João Silva",
            cpf="12345678901",
            email="joao@doctor.com",
            password="senha123",
            birthdate=date(1980, 5, 10),
            crm="654321",
            specialty="Cardiologia",
            cep="12345-678",
            street="Rua Médica",
            number="100",
            complement="Sala 5",
            neighborhood="Centro",
            city="São Paulo",
            state="SP",
        )

        with patch(
            "core.services.doctor_service.user_service.get_user_by_email", return_value=None
        ):
            with patch(
                "core.services.doctor_service.user_service.get_user_by_cpf",
                return_value=None,
            ):
                with patch(
                    "core.services.doctor_service.get_doctor_by_crm", return_value=None
                ):
                    with patch(
                        "core.services.doctor_service.address_service.get_similar_address",
                        return_value=sample_address,
                    ):
                        with patch(
                            "core.services.doctor_service.get_password_hash",
                            return_value="hashed",
                        ):
                            # Act
                            result = doctor_service.create_doctor(doctor_data, mock_session)

                            # Assert
                            assert result == doctor_data
                            mock_session.add.assert_called_once()
                            mock_session.commit.assert_called_once()
                            mock_session.refresh.assert_called_once()

    def test_create_doctor_duplicate_email(self, mock_session, sample_doctor):
        """Testa criação de médico com email duplicado."""
        # Arrange
        doctor_data = DoctorSchema(
            fullname="Outro Médico",
            cpf="11111111111",
            email="maria@example.com",
            password="senha123",
            birthdate=date(1985, 3, 15),
            crm="999999",
            specialty="Neurologia",
            cep="11111-111",
            street="Rua",
            number="10",
            complement=None,
            neighborhood="Bairro",
            city="São Paulo",
            state="SP",
        )

        with patch(
            "core.services.doctor_service.user_service.get_user_by_email",
            return_value=sample_doctor,
        ):
            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                doctor_service.create_doctor(doctor_data, mock_session)

            assert exc_info.value.status_code == HTTPStatus.CONFLICT
            assert "Já existe um usuário com o email informado." in exc_info.value.detail

    def test_create_doctor_duplicate_cpf(self, mock_session, sample_doctor):
        """Testa criação de médico com CPF duplicado."""
        # Arrange
        doctor_data = DoctorSchema(
            fullname="Outro Médico",
            cpf="98765432100",
            email="novo@example.com",
            password="senha123",
            birthdate=date(1985, 3, 15),
            crm="999999",
            specialty="Neurologia",
            cep="11111-111",
            street="Rua",
            number="10",
            complement=None,
            neighborhood="Bairro",
            city="São Paulo",
            state="SP",
        )

        with patch(
            "core.services.doctor_service.user_service.get_user_by_email", return_value=None
        ):
            with patch(
                "core.services.doctor_service.user_service.get_user_by_cpf",
                return_value=sample_doctor,
            ):
                # Act & Assert
                with pytest.raises(HTTPException) as exc_info:
                    doctor_service.create_doctor(doctor_data, mock_session)

                assert exc_info.value.status_code == HTTPStatus.CONFLICT
                assert "O CPF informado já está em uso." in exc_info.value.detail

    def test_create_doctor_duplicate_crm(self, mock_session, sample_doctor):
        """Testa criação de médico com CRM duplicado."""
        # Arrange
        doctor_data = DoctorSchema(
            fullname="Outro Médico",
            cpf="11111111111",
            email="novo@example.com",
            password="senha123",
            birthdate=date(1985, 3, 15),
            crm="123456",
            specialty="Neurologia",
            cep="11111-111",
            street="Rua",
            number="10",
            complement=None,
            neighborhood="Bairro",
            city="São Paulo",
            state="SP",
        )

        with patch(
            "core.services.doctor_service.user_service.get_user_by_email", return_value=None
        ):
            with patch(
                "core.services.doctor_service.user_service.get_user_by_cpf",
                return_value=None,
            ):
                with patch(
                    "core.services.doctor_service.get_doctor_by_crm",
                    return_value=sample_doctor,
                ):
                    # Act & Assert
                    with pytest.raises(HTTPException) as exc_info:
                        doctor_service.create_doctor(doctor_data, mock_session)

                    assert exc_info.value.status_code == HTTPStatus.CONFLICT
                    assert "O CRM informado já está em uso." in exc_info.value.detail

    def test_get_doctor_by_crm_found(self, mock_session, sample_doctor):
        """Testa busca de médico por CRM quando ele existe."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = sample_doctor
        mock_session.query.return_value = mock_query

        # Act
        result = doctor_service.get_doctor_by_crm(mock_session, crm="123456")

        # Assert
        assert result == sample_doctor
        mock_session.query.assert_called_once_with(Doctor)

    def test_get_doctor_by_crm_not_found(self, mock_session):
        """Testa busca de médico por CRM quando ele não existe."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = None
        mock_session.query.return_value = mock_query

        # Act
        result = doctor_service.get_doctor_by_crm(mock_session, crm="999999")

        # Assert
        assert result is None

    def test_get_pending_binding_requests(
        self, mock_session, sample_doctor, sample_patient
    ):
        """Testa busca de solicitações de vínculo pendentes."""
        # Arrange
        pending_bind = Bind(
            doctor_id=sample_doctor.id,
            patient_id=sample_patient.id,
            status=BindEnum.PENDING,
        )
        pending_bind.id = 1

        mock_query = MagicMock()
        mock_query.filter.return_value.join.return_value.all.return_value = [
            (pending_bind, sample_patient)
        ]
        mock_session.query.return_value = mock_query

        # Act
        result = doctor_service.get_pending_binding_requests(sample_doctor, mock_session)

        # Assert
        assert len(result) == 1
        assert result[0][0].status == BindEnum.PENDING
        assert result[0][1] == sample_patient

    def test_get_doctors_with_filters(self, mock_session, sample_doctor):
        """Testa busca de médicos com filtros."""
        # Arrange
        search_params = GetDoctorsSchema(
            expertise_area="Neurologia",
        )

        mock_query = MagicMock()
        mock_query.options.return_value.filter_by.return_value.all.return_value = [
            sample_doctor
        ]
        mock_session.query.return_value = mock_query

        # Act
        result = doctor_service.get_doctors(mock_session, search_params)

        # Assert
        assert len(result) == 1
        assert result[0].name == sample_doctor.name
        assert result[0].specialty == sample_doctor.expertise_area

    def test_get_doctors_not_found(self, mock_session):
        """Testa busca de médicos quando nenhum é encontrado."""
        # Arrange
        search_params = GetDoctorsSchema(expertise_area="Cardiologia")

        mock_query = MagicMock()
        mock_query.options.return_value.filter_by.return_value.all.return_value = []
        mock_session.query.return_value = mock_query

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            doctor_service.get_doctors(mock_session, search_params)

        assert exc_info.value.status_code == HTTPStatus.NOT_FOUND

    def test_activate_binding_request(self, mock_session, sample_doctor):
        """Testa aprovação de solicitação de vínculo."""
        # Arrange
        bind = Bind(doctor_id=sample_doctor.id, patient_id=3, status=BindEnum.PENDING)
        bind.id = 1

        mock_query = MagicMock()
        mock_query.filter_by.return_value.first.return_value = bind
        mock_session.query.return_value = mock_query

        # Act
        result = doctor_service.activate_or_reject_binding_request(
            user=sample_doctor,
            binding_id=1,
            session=mock_session,
            new_status=BindEnum.ACTIVE,
        )

        # Assert
        assert bind.status == BindEnum.ACTIVE
        mock_session.add.assert_called_once_with(bind)
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once_with(bind)

    def test_reject_binding_request(self, mock_session, sample_doctor):
        """Testa rejeição de solicitação de vínculo."""
        # Arrange
        bind = Bind(doctor_id=sample_doctor.id, patient_id=3, status=BindEnum.PENDING)
        bind.id = 1

        mock_query = MagicMock()
        mock_query.filter_by.return_value.first.return_value = bind
        mock_session.query.return_value = mock_query

        # Act
        result = doctor_service.activate_or_reject_binding_request(
            user=sample_doctor,
            binding_id=1,
            session=mock_session,
            new_status=BindEnum.REJECTED,
        )

        # Assert
        assert bind.status == BindEnum.REJECTED
        mock_session.add.assert_called_once_with(bind)
        mock_session.commit.assert_called_once()

    def test_get_binded_doctors(self, mock_session, sample_patient, sample_doctor):
        """Testa busca de médicos vinculados a um paciente."""
        # Arrange
        with patch("core.services.doctor_service.get_binded_users") as mock_get_binded:
            mock_get_binded.return_value = [{"bind_id": 1, "user": sample_doctor}]

            # Act
            result = doctor_service.get_binded_doctors(mock_session, sample_patient)

            # Assert
            assert len(result) == 1
            assert result[0].id == sample_doctor.id
            assert result[0].bind_id == 1
            assert result[0].role == UserType.DOCTOR

    def test_create_doctor_with_new_address(self, mock_session):
        """Testa criação de médico quando endereço não existe."""
        # Arrange
        doctor_data = DoctorSchema(
            fullname="Dr. Pedro Costa",
            cpf="55566677788",
            email="pedro@doctor.com",
            password="senha123",
            birthdate=date(1978, 8, 25),
            crm="777888",
            specialty="Cardiologia",
            cep="99999-999",
            street="Rua Nova",
            number="500",
            complement="Sala 10",
            neighborhood="Jardim",
            city="Curitiba",
            state="PR",
        )

        mock_address = MagicMock()
        mock_address.id = 10

        with patch(
            "core.services.doctor_service.user_service.get_user_by_email", return_value=None
        ):
            with patch(
                "core.services.doctor_service.user_service.get_user_by_cpf",
                return_value=None,
            ):
                with patch(
                    "core.services.doctor_service.get_doctor_by_crm", return_value=None
                ):
                    with patch(
                        "core.services.doctor_service.address_service.get_similar_address",
                        side_effect=[None, mock_address],
                    ):
                        with patch(
                            "core.services.doctor_service.address_service.create_address"
                        ):
                            with patch(
                                "core.services.doctor_service.get_password_hash",
                                return_value="hashed",
                            ):
                                # Act
                                result = doctor_service.create_doctor(
                                    doctor_data, mock_session
                                )

                                # Assert
                                assert result == doctor_data
                                mock_session.add.assert_called_once()
                                mock_session.commit.assert_called_once()

    def test_get_sent_binding_requests(self, mock_session, sample_patient, sample_doctor):
        """Testa busca de solicitações de vínculo enviadas por paciente."""
        # Arrange
        pending_bind = Bind(
            doctor_id=sample_doctor.id,
            patient_id=sample_patient.id,
            status=BindEnum.PENDING,
        )
        pending_bind.id = 1

        mock_query = MagicMock()
        mock_query.filter.return_value.join.return_value.all.return_value = [
            (pending_bind, sample_doctor)
        ]
        mock_session.query.return_value = mock_query

        # Act
        result = doctor_service.get_sent_binding_requests(sample_patient, mock_session)

        # Assert
        assert len(result) == 1
        assert result[0][0].status == BindEnum.PENDING
        assert result[0][1] == sample_doctor

    def test_activate_binding_request_not_found(self, mock_session, sample_doctor):
        """Testa aprovação de solicitação de vínculo quando ela não existe."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter_by.return_value.first.return_value = None
        mock_session.query.return_value = mock_query

        # Act
        result = doctor_service.activate_or_reject_binding_request(
            user=sample_doctor,
            binding_id=999,
            session=mock_session,
            new_status=BindEnum.ACTIVE,
        )

        # Assert
        assert isinstance(result, HTTPException)
        assert result.status_code == HTTPStatus.NOT_FOUND
