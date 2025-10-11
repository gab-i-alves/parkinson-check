from http import HTTPStatus
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from core.models import Address
from core.services import address_service


class TestAddressService:
    """Testes para o serviço de gerenciamento de endereços."""

    def test_get_similar_address_found(self, mock_session, sample_address):
        """Testa busca de endereço similar quando ele existe."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = sample_address
        mock_session.query.return_value = mock_query

        # Act
        result = address_service.get_similar_address(
            cep="12345-678",
            number="123",
            complement="Apto 101",
            session=mock_session,
        )

        # Assert
        assert result == sample_address
        assert result.cep == "12345-678"
        assert result.number == "123"
        assert result.complement == "Apto 101"
        mock_session.query.assert_called_once_with(Address)

    def test_get_similar_address_not_found(self, mock_session):
        """Testa busca de endereço similar quando ele não existe."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = None
        mock_session.query.return_value = mock_query

        # Act
        result = address_service.get_similar_address(
            cep="99999-999",
            number="999",
            complement="N/A",
            session=mock_session,
        )

        # Assert
        assert result is None

    def test_create_address_success(self, mock_session):
        """Testa criação de endereço com sucesso."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = None
        mock_session.query.return_value = mock_query

        mock_session.add.return_value = None
        mock_session.commit.return_value = None
        mock_session.refresh.side_effect = lambda addr: setattr(addr, "id", 1)

        # Act
        result = address_service.create_address(
            cep="11111-111",
            street="Rua Nova",
            number="456",
            complement="Casa",
            neighborhood="Bairro Novo",
            city="Rio de Janeiro",
            state="RJ",
            session=mock_session,
        )

        # Assert
        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once()

    def test_create_address_duplicate(self, mock_session, sample_address):
        """Testa criação de endereço quando já existe um endereço similar."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = sample_address
        mock_session.query.return_value = mock_query

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            address_service.create_address(
                cep="12345-678",
                street="Rua Exemplo",
                number="123",
                complement="Apto 101",
                neighborhood="Centro",
                city="São Paulo",
                state="SP",
                session=mock_session,
            )

        assert exc_info.value.status_code == HTTPStatus.CONFLICT
        assert "Endereço já existente" in exc_info.value.detail
        mock_session.add.assert_not_called()
        mock_session.commit.assert_not_called()

    def test_create_address_without_complement(self, mock_session):
        """Testa criação de endereço sem complemento."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = None
        mock_session.query.return_value = mock_query

        # Act
        result = address_service.create_address(
            cep="22222-222",
            street="Avenida Principal",
            number="789",
            complement=None,
            neighborhood="Centro",
            city="Belo Horizonte",
            state="MG",
            session=mock_session,
        )

        # Assert
        mock_session.add.assert_called_once()
        added_address = mock_session.add.call_args[0][0]
        assert added_address.complement is None

    def test_get_by_id_found(self, mock_session, sample_address):
        """Testa busca de endereço por ID quando ele existe."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = sample_address
        mock_session.query.return_value = mock_query

        # Act
        result = address_service.get_by_id(id=1, session=mock_session)

        # Assert
        assert result == sample_address
        assert result.id == 1
        mock_session.query.assert_called_once_with(Address)

    def test_get_by_id_not_found(self, mock_session):
        """Testa busca de endereço por ID quando ele não existe."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = None
        mock_session.query.return_value = mock_query

        # Act
        result = address_service.get_by_id(id=999, session=mock_session)

        # Assert
        assert result is None

    def test_get_similar_address_uses_all_criteria(self, mock_session):
        """Testa se a busca usa todos os critérios (cep, number, complement)."""
        # Arrange
        mock_query = MagicMock()
        mock_filter = mock_query.filter.return_value
        mock_filter.first.return_value = None
        mock_session.query.return_value = mock_query

        # Act
        address_service.get_similar_address(
            cep="12345-678",
            number="123",
            complement="Apto 101",
            session=mock_session,
        )

        # Assert
        mock_query.filter.assert_called_once()
