from pathlib import Path
from fastapi import BackgroundTasks
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

from infra.settings import Settings

TEMPLATE_PATH = Path(__file__).parent.parent / "utils" / "email_templates"

conf = ConnectionConfig(
    MAIL_USERNAME=Settings().SMTP_USER,
    MAIL_PASSWORD=Settings().SMTP_PASSWORD,
    MAIL_PORT=Settings().SMTP_PORT,
    MAIL_SERVER=Settings().SMTP_HOST,
    USE_CREDENTIALS=True,
    TEMPLATE_FOLDER=TEMPLATE_PATH,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    MAIL_FROM=Settings().SMTP_USER
)

async def send_password_reset_email(email_to: str, body: dict):
    message = MessageSchema(
        subject='ParkinsonCheck - Redefinir Senha',
        recipients=[email_to],
        body=body,
        subtype=MessageType.html,
    )
    fm = FastMail(conf)
    await fm.send_message(message, template_name='password_reset.html')