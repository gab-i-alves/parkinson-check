from http import HTTPStatus
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from core.enums import BindEnum
from core.models import Bind, User
from core.services import user_service


class TestUserService:
    """Testes para o serviço de gerenciamento de usuários."""

    def test_get_user_by_email_found(self, mock_session, sample_user):
        """Testa busca de usuário por email quando usuário existe."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = sample_user
        mock_session.query.return_value = mock_query

        # Act
        result = user_service.get_user_by_email("joao@example.com", mock_session)

        # Assert
        assert result == sample_user
        assert result.email == "joao@example.com"
        mock_session.query.assert_called_once_with(User)

    def test_get_user_by_email_not_found(self, mock_session):
        """Testa busca de usuário por email quando usuário não existe."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = None
        mock_session.query.return_value = mock_query

        # Act
        result = user_service.get_user_by_email("naoexiste@example.com", mock_session)

        # Assert
        assert result is None

    def test_get_user_by_cpf_found(self, mock_session, sample_user):
        """Testa busca de usuário por CPF quando usuário existe."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = sample_user
        mock_session.query.return_value = mock_query

        # Act
        result = user_service.get_user_by_cpf("12345678901", mock_session)

        # Assert
        assert result == sample_user
        assert result.cpf == "12345678901"
        mock_session.query.assert_called_once_with(User)

    def test_get_user_by_cpf_not_found(self, mock_session):
        """Testa busca de usuário por CPF quando usuário não existe."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = None
        mock_session.query.return_value = mock_query

        # Act
        result = user_service.get_user_by_cpf("00000000000", mock_session)

        # Assert
        assert result is None

    def test_get_user_active_binds_with_binds(self, mock_session, sample_user):
        """Testa busca de vínculos ativos quando o usuário tem vínculos."""
        # Arrange
        bind1 = Bind(doctor_id=2, patient_id=sample_user.id, status=BindEnum.ACTIVE)
        bind1.id = 1
        bind2 = Bind(doctor_id=3, patient_id=sample_user.id, status=BindEnum.ACTIVE)
        bind2.id = 2
        active_binds = [bind1, bind2]

        mock_query = MagicMock()
        mock_query.filter.return_value.all.return_value = active_binds
        mock_session.query.return_value = mock_query

        # Act
        result = user_service.get_user_active_binds(sample_user, mock_session)

        # Assert
        assert len(result) == 2
        assert all(bind.status == BindEnum.ACTIVE for bind in result)
        mock_session.query.assert_called_once_with(Bind)

    def test_get_user_active_binds_without_binds(self, mock_session, sample_user):
        """Testa busca de vínculos ativos quando o usuário não tem vínculos."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value.all.return_value = []
        mock_session.query.return_value = mock_query

        # Act
        result = user_service.get_user_active_binds(sample_user, mock_session)

        # Assert
        assert result == []

    def test_get_user_active_binds_filters_by_status(self, mock_session, sample_user):
        """Testa que apenas vínculos ACTIVE são retornados."""
        # Arrange
        bind1 = Bind(doctor_id=2, patient_id=sample_user.id, status=BindEnum.ACTIVE)
        bind1.id = 1
        active_only = [bind1]

        mock_query = MagicMock()
        mock_query.filter.return_value.all.return_value = active_only
        mock_session.query.return_value = mock_query

        # Act
        result = user_service.get_user_active_binds(sample_user, mock_session)

        # Assert
        assert len(result) == 1
        assert result[0].status == BindEnum.ACTIVE

    def test_get_binded_users_success(self, mock_session, sample_patient, sample_doctor):
        """Testa busca de usuários vinculados com sucesso."""
        # Arrange
        active_bind = Bind(
            doctor_id=sample_doctor.id,
            patient_id=sample_patient.id,
            status=BindEnum.ACTIVE,
        )
        active_bind.id = 1

        # Mock da busca de binds ativos
        mock_bind_query = MagicMock()
        mock_bind_query.filter.return_value.all.return_value = [active_bind]

        # Mock da busca de usuários vinculados
        mock_user_query = MagicMock()
        mock_user_query.filter.return_value.all.return_value = [sample_doctor]

        mock_session.query.side_effect = [mock_bind_query, mock_user_query]

        # Act
        result = user_service.get_binded_users(sample_patient, mock_session)

        # Assert
        assert len(result) == 1
        assert result[0]["bind_id"] == active_bind.id
        assert result[0]["user"] == sample_doctor

    def test_get_binded_users_no_active_binds(self, mock_session, sample_user):
        """Testa busca de usuários vinculados quando não há vínculos ativos."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value.all.return_value = []
        mock_session.query.return_value = mock_query

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            user_service.get_binded_users(sample_user, mock_session)

        assert exc_info.value.status_code == HTTPStatus.BAD_REQUEST
        assert "Usuário sem atrelamentos ativos." in exc_info.value.detail

    def test_get_binded_users_as_doctor(self, mock_session, sample_doctor, sample_patient):
        """Testa busca de usuários vinculados do ponto de vista do médico."""
        # Arrange
        active_bind = Bind(
            doctor_id=sample_doctor.id,
            patient_id=sample_patient.id,
            status=BindEnum.ACTIVE,
        )
        active_bind.id = 1

        mock_bind_query = MagicMock()
        mock_bind_query.filter.return_value.all.return_value = [active_bind]

        mock_user_query = MagicMock()
        mock_user_query.filter.return_value.all.return_value = [sample_patient]

        mock_session.query.side_effect = [mock_bind_query, mock_user_query]

        # Act
        result = user_service.get_binded_users(sample_doctor, mock_session)

        # Assert
        assert len(result) == 1
        assert result[0]["bind_id"] == active_bind.id
        assert result[0]["user"] == sample_patient
