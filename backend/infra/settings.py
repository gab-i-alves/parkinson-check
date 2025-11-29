import os
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


# Busca os dados do .env
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REMEMBER_ME_EXPIRE_DAYS: int
    ENVIRONMENT: str
    FRONTEND_URL: str = "http://localhost:4200"

    # SMTP settings (for development)
    SMTP_HOST: str | None = None
    SMTP_PORT: str | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None

    # Resend settings (for production)
    RESEND_API_KEY: str | None = None
    RESEND_FROM_EMAIL: str = "noreply@gabi-alves.com"

    # URLs dos serviços de ML (Railway internal URLs)
    SPIRAL_CLASSIFIER_URL: str = os.getenv(
        "SPIRAL_CLASSIFIER_URL", "http://spiral-classifier:8001"
    )
    VOICE_CLASSIFIER_URL: str = os.getenv(
        "VOICE_CLASSIFIER_URL", "http://voice-classifier:8002"
    )

    BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH: str = os.path.join(BASE_DIR, "models", "rf_model.pkl")
    EMAIL_TEMPLATES_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "core",
        "utils",
        "email_templates",
    )
    
    UPLOAD_DIR: str = "uploads/doctor_documents"
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_MIME_TYPES: List[str] = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg"
    ]


settings = Settings()
