from http import HTTPStatus
from unittest.mock import MagicMock, mock_open, patch

import httpx
import pytest
from fastapi import HTTPException, UploadFile

from api.schemas.tests import SpiralImageSchema
from core.enums import BindEnum, TestType
from core.models import Bind, SpiralTest, Test, VoiceTest
from core.services import test_service


class TestTestService:
    """Testes para o serviço de processamento de testes (espiral e voz)."""

    def test_process_spiral_as_practice_success(self):
        """Testa processamento de espiral como prática com sucesso."""
        # Arrange
        schema = SpiralImageSchema(
            image_filename="spiral.png",
            image_content=b"fake_image_content",
            image_content_type="image/png",
        )

        mock_response = MagicMock()
        mock_response.json.return_value = {
            "prediction": "healthy",
            "confidence": 0.95,
        }

        with patch("core.services.test_service.httpx.Client") as mock_client:
            mock_client.return_value.__enter__.return_value.post.return_value = (
                mock_response
            )

            # Act
            result = test_service.process_spiral_as_practice(schema)

            # Assert
            assert result["prediction"] == "healthy"
            assert result["confidence"] == 0.95

    def test_process_spiral_as_practice_http_error(self):
        """Testa processamento de espiral quando serviço retorna erro HTTP."""
        # Arrange
        schema = SpiralImageSchema(
            image_filename="spiral.png",
            image_content=b"fake_image_content",
            image_content_type="image/png",
        )

        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.json.return_value = {"detail": "Internal server error"}
        mock_response.text = "Error occurred"

        with patch("core.services.test_service.httpx.Client") as mock_client:
            mock_post = mock_client.return_value.__enter__.return_value.post
            mock_post.side_effect = httpx.HTTPStatusError(
                "Error", request=MagicMock(), response=mock_response
            )

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                test_service.process_spiral_as_practice(schema)

            assert "Erro no serviço de análise de imagem" in exc_info.value.detail

    def test_process_spiral_as_practice_connection_error(self):
        """Testa processamento de espiral quando há erro de conexão."""
        # Arrange
        schema = SpiralImageSchema(
            image_filename="spiral.png",
            image_content=b"fake_image_content",
            image_content_type="image/png",
        )

        with patch("core.services.test_service.httpx.Client") as mock_client:
            mock_post = mock_client.return_value.__enter__.return_value.post
            mock_post.side_effect = httpx.RequestError("Connection failed")

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                test_service.process_spiral_as_practice(schema)

            assert exc_info.value.status_code == HTTPStatus.SERVICE_UNAVAILABLE
            assert "Não foi possível comunicar com o serviço" in exc_info.value.detail

    def test_process_voice_as_practice_success(self):
        """Testa processamento de voz como prática com sucesso."""
        # Arrange
        mock_audio = MagicMock(spec=UploadFile)
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "prediction": "parkinson",
            "confidence": 0.88,
        }

        with patch(
            "core.services.test_service.convert_webm_to_wav", return_value="/tmp/audio.wav"
        ):
            with patch("builtins.open", mock_open(read_data=b"wav_content")):
                with patch("core.services.test_service.httpx.Client") as mock_client:
                    mock_client.return_value.__enter__.return_value.post.return_value = (
                        mock_response
                    )
                    with patch(
                        "core.services.test_service.os.path.exists", return_value=True
                    ):
                        with patch("core.services.test_service.os.remove") as mock_remove:
                            # Act
                            result = test_service.process_voice_as_practice(mock_audio)

                            # Assert
                            assert result["prediction"] == "parkinson"
                            assert result["confidence"] == 0.88
                            mock_remove.assert_called_once_with("/tmp/audio.wav")

    def test_process_voice_as_practice_http_error(self):
        """Testa processamento de voz quando serviço retorna erro HTTP."""
        # Arrange
        mock_audio = MagicMock(spec=UploadFile)
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.json.return_value = {"detail": "Internal error"}
        mock_response.text = "Error"

        with patch(
            "core.services.test_service.convert_webm_to_wav", return_value="/tmp/audio.wav"
        ):
            with patch("builtins.open", mock_open(read_data=b"wav_content")):
                with patch("core.services.test_service.httpx.Client") as mock_client:
                    mock_post = mock_client.return_value.__enter__.return_value.post
                    mock_post.side_effect = httpx.HTTPStatusError(
                        "Error", request=MagicMock(), response=mock_response
                    )
                    with patch(
                        "core.services.test_service.os.path.exists", return_value=True
                    ):
                        with patch("core.services.test_service.os.remove"):
                            # Act & Assert
                            with pytest.raises(HTTPException) as exc_info:
                                test_service.process_voice_as_practice(mock_audio)

                            assert (
                                "Erro no serviço de análise de voz" in exc_info.value.detail
                            )

    def test_get_patient_tests_success(self, mock_session, sample_doctor, sample_patient):
        """Testa busca de testes de um paciente com sucesso."""
        # Arrange
        active_bind = Bind(
            doctor_id=sample_doctor.id,
            patient_id=sample_patient.id,
            status=BindEnum.ACTIVE,
        )
        active_bind.id = 1

        test1 = MagicMock(spec=Test)
        test1.id = 1
        test1.patient_id = sample_patient.id
        test1.score = 0.75
        test1.execution_date = "2023-10-01"
        test1.test_type = TestType.VOICE_TEST

        mock_bind_query = MagicMock()
        mock_bind_query.filter.return_value.all.return_value = [active_bind]

        mock_test_query = MagicMock()
        mock_test_query.filter.return_value.all.return_value = [test1]

        mock_session.query.side_effect = [mock_bind_query, mock_test_query]

        # Act
        result = test_service.get_patient_tests(
            mock_session, sample_doctor, sample_patient.id
        )

        # Assert
        assert len(result) == 1
        assert result[0].test_id == test1.id

    def test_get_patient_tests_no_binds(self, mock_session, sample_doctor):
        """Testa busca de testes quando médico não tem vínculos."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value.all.return_value = []
        mock_session.query.return_value = mock_query

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            test_service.get_patient_tests(mock_session, sample_doctor, patient_id=999)

        assert exc_info.value.status_code == HTTPStatus.NOT_FOUND
        assert "Paciente não encontrado." in exc_info.value.detail

    def test_get_patient_tests_forbidden_access(
        self, mock_session, sample_doctor, sample_patient
    ):
        """Testa busca de testes quando médico não tem acesso ao paciente."""
        # Arrange
        other_patient_id = 999
        active_bind = Bind(
            doctor_id=sample_doctor.id,
            patient_id=sample_patient.id,
            status=BindEnum.ACTIVE,
        )
        active_bind.id = 1

        mock_query = MagicMock()
        mock_query.filter.return_value.all.return_value = [active_bind]
        mock_session.query.return_value = mock_query

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            test_service.get_patient_tests(mock_session, sample_doctor, other_patient_id)

        assert exc_info.value.status_code == HTTPStatus.FORBIDDEN
        assert "O médico não tem acesso ao paciente informado." in exc_info.value.detail

    def test_get_patient_detaild_tests_success(
        self, mock_session, sample_doctor, sample_patient
    ):
        """Testa busca detalhada de testes com sucesso."""
        from datetime import datetime

        from core.enums import SpiralMethods

        # Arrange
        active_bind = Bind(
            doctor_id=sample_doctor.id,
            patient_id=sample_patient.id,
            status=BindEnum.ACTIVE,
        )
        active_bind.id = 1

        # Create mock objects with all required attributes properly set
        voice_test = MagicMock(spec=VoiceTest)
        voice_test.id = 1
        voice_test.test_type = TestType.VOICE_TEST
        voice_test.execution_date = datetime.now().date()
        voice_test.score = 0.85
        voice_test.patient_id = sample_patient.id
        voice_test.record_duration = 5.5

        spiral_test = MagicMock(spec=SpiralTest)
        spiral_test.id = 2
        spiral_test.test_type = TestType.SPIRAL_TEST
        spiral_test.execution_date = datetime.now().date()
        spiral_test.score = 0.92
        spiral_test.patient_id = sample_patient.id
        spiral_test.draw_duration = 10.3
        spiral_test.method = SpiralMethods.PAPER

        mock_bind_query = MagicMock()
        mock_bind_query.filter.return_value.all.return_value = [active_bind]

        mock_voice_query = MagicMock()
        mock_voice_query.filter.return_value.all.return_value = [voice_test]

        mock_spiral_query = MagicMock()
        mock_spiral_query.filter.return_value.all.return_value = [spiral_test]

        mock_session.query.side_effect = [
            mock_bind_query,
            mock_voice_query,
            mock_spiral_query,
        ]

        # Act
        result = test_service.get_patient_detaild_tests(
            mock_session, sample_doctor, sample_patient.id
        )

        # Assert
        assert len(result.voice_tests) == 1
        assert len(result.spiral_tests) == 1
        assert result.voice_tests[0].id == 1
        assert result.spiral_tests[0].id == 2

    def test_get_patient_detaild_tests_no_access(self, mock_session, sample_doctor):
        """Testa busca detalhada quando médico não tem acesso."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value.all.return_value = []
        mock_session.query.return_value = mock_query

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            test_service.get_patient_detaild_tests(
                mock_session, sample_doctor, patient_id=999
            )

        assert exc_info.value.status_code == HTTPStatus.NOT_FOUND
        assert "Paciente não encontrado." in exc_info.value.detail

    def test_process_voice_cleans_up_temp_file(self):
        """Testa se arquivo temporário é removido após processamento."""
        # Arrange
        mock_audio = MagicMock(spec=UploadFile)
        temp_file = "/tmp/test_audio.wav"

        with patch(
            "core.services.test_service.convert_webm_to_wav", return_value=temp_file
        ):
            with patch("builtins.open", mock_open(read_data=b"wav_content")):
                with patch("core.services.test_service.httpx.Client") as mock_client:
                    mock_response = MagicMock()
                    mock_response.json.return_value = {"prediction": "healthy"}
                    mock_client.return_value.__enter__.return_value.post.return_value = (
                        mock_response
                    )

                    with patch(
                        "core.services.test_service.os.path.exists", return_value=True
                    ):
                        with patch("core.services.test_service.os.remove") as mock_remove:
                            # Act
                            test_service.process_voice_as_practice(mock_audio)

                            # Assert
                            mock_remove.assert_called_once_with(temp_file)

    def test_process_voice_as_practice_connection_error(self):
        """Testa processamento de voz quando há erro de conexão."""
        # Arrange
        mock_audio = MagicMock(spec=UploadFile)

        with patch(
            "core.services.test_service.convert_webm_to_wav", return_value="/tmp/audio.wav"
        ):
            with patch("builtins.open", mock_open(read_data=b"wav_content")):
                with patch("core.services.test_service.httpx.Client") as mock_client:
                    mock_post = mock_client.return_value.__enter__.return_value.post
                    mock_post.side_effect = httpx.RequestError("Connection failed")
                    with patch(
                        "core.services.test_service.os.path.exists", return_value=True
                    ):
                        with patch("core.services.test_service.os.remove"):
                            # Act & Assert
                            with pytest.raises(HTTPException) as exc_info:
                                test_service.process_voice_as_practice(mock_audio)

                            assert exc_info.value.status_code == 503
                            assert (
                                "Não foi possível comunicar com o serviço"
                                in exc_info.value.detail
                            )

    def test_process_voice_as_practice_generic_error(self):
        """Testa processamento de voz quando há erro genérico."""
        # Arrange
        mock_audio = MagicMock(spec=UploadFile)

        with patch(
            "core.services.test_service.convert_webm_to_wav",
            side_effect=Exception("Unexpected error"),
        ):
            with patch("core.services.test_service.os.path.exists", return_value=False):
                # Act & Assert
                with pytest.raises(HTTPException) as exc_info:
                    test_service.process_voice_as_practice(mock_audio)

                assert exc_info.value.status_code == 500
                assert "Erro no processamento do áudio" in exc_info.value.detail

    def test_get_patient_detaild_tests_forbidden_access(
        self, mock_session, sample_doctor, sample_patient
    ):
        """Testa busca detalhada quando médico não tem acesso ao paciente."""
        # Arrange
        other_patient_id = 999
        active_bind = Bind(
            doctor_id=sample_doctor.id,
            patient_id=sample_patient.id,
            status=BindEnum.ACTIVE,
        )
        active_bind.id = 1

        mock_query = MagicMock()
        mock_query.filter.return_value.all.return_value = [active_bind]
        mock_session.query.return_value = mock_query

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            test_service.get_patient_detaild_tests(
                mock_session, sample_doctor, other_patient_id
            )

        assert exc_info.value.status_code == HTTPStatus.FORBIDDEN
        assert "O médico não tem acesso ao paciente informado." in exc_info.value.detail
