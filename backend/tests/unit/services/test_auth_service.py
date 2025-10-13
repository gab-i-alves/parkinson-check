from http import HTTPStatus
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from api.schemas.auth import LoginFormRequest
from api.schemas.token import TokenResponse, UserResponse
from core.services import auth_service


class TestAuthService:
    """Testes para o serviço de autenticação."""

    def test_login_success(self, mock_session, sample_user):
        """Testa login bem-sucedido com credenciais válidas."""
        # Arrange
        login_form = LoginFormRequest(
            email="joao@example.com",
            password="senha_correta",
        )

        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = sample_user
        mock_session.query.return_value = mock_query

        with patch("core.services.auth_service.verify_password") as mock_verify:
            mock_verify.return_value = True
            with patch("core.services.auth_service.create_access_token") as mock_token:
                mock_token.return_value = "mock_token_123"

                # Act
                result = auth_service.login(login_form, mock_session)

                # Assert
                assert isinstance(result, TokenResponse)
                assert result.access_token == "mock_token_123"
                assert isinstance(result.user, UserResponse)
                assert result.user.id == sample_user.id
                assert result.user.email == sample_user.email
                assert result.user.name == sample_user.name
                mock_verify.assert_called_once_with(
                    "senha_correta", sample_user.hashed_password
                )

    def test_login_user_not_found(self, mock_session):
        """Testa falha de login quando usuário não existe."""
        # Arrange
        login_form = LoginFormRequest(
            email="naoexiste@example.com",
            password="senha123",
        )

        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = None
        mock_session.query.return_value = mock_query

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            auth_service.login(login_form, mock_session)

        assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED
        assert "Verifique as credenciais de acesso." in exc_info.value.detail

    def test_login_incorrect_password(self, mock_session, sample_user):
        """Testa falha de login quando senha está incorreta."""
        # Arrange
        login_form = LoginFormRequest(
            email="joao@example.com",
            password="senha_errada",
        )

        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = sample_user
        mock_session.query.return_value = mock_query

        with patch("core.services.auth_service.verify_password") as mock_verify:
            mock_verify.return_value = False

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                auth_service.login(login_form, mock_session)

            assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED
            assert "Verifique as credenciais de acesso." in exc_info.value.detail

    def test_login_creates_valid_token_data(self, mock_session, sample_user):
        """Testa se o token é criado com os dados corretos."""
        # Arrange
        login_form = LoginFormRequest(
            email="joao@example.com",
            password="senha123",
        )

        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = sample_user
        mock_session.query.return_value = mock_query

        with patch("core.services.auth_service.verify_password", return_value=True):
            with patch("core.services.auth_service.create_access_token") as mock_token:
                mock_token.return_value = "token_abc"

                # Act
                auth_service.login(login_form, mock_session)

                # Assert
                mock_token.assert_called_once_with(data={"sub": login_form.email})

    def test_login_returns_correct_user_response(self, mock_session, sample_user):
        """Testa se o UserResponse contém as informações corretas do usuário."""
        # Arrange
        login_form = LoginFormRequest(
            email="joao@example.com",
            password="senha123",
        )

        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = sample_user
        mock_session.query.return_value = mock_query

        with patch("core.services.auth_service.verify_password", return_value=True):
            with patch(
                "core.services.auth_service.create_access_token", return_value="token"
            ):
                # Act
                result = auth_service.login(login_form, mock_session)

                # Assert
                assert result.user.id == sample_user.id
                assert result.user.name == sample_user.name
                assert result.user.email == sample_user.email
                assert result.user.role == sample_user.user_type
