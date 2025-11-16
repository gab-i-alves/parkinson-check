import os

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
    SMTP_HOST: str
    SMTP_PORT: str
    SMTP_USER: str
    SMTP_PASSWORD: str

    BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH: str = os.path.join(BASE_DIR, "models", "rf_model.pkl")
    EMAIL_TEMPLATES_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "core",
        "utils",
        "email_templates",
    )


settings = Settings()
