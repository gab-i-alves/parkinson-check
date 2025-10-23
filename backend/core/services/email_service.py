from pathlib import Path
from fastapi import BackgroundTasks
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from jinja2 import Environment, FileSystemLoader

from infra.settings import Settings

TEMPLATE_PATH = Path(__file__).parent.parent / "utils" / "email_templates"

env = Environment(
    loader=FileSystemLoader(TEMPLATE_PATH),
    autoescape=True
)

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

        

async def send_password_reset_email_background(background_tasks: BackgroundTasks, email_to: str, token: dict):
        background_tasks.add_task(send_password_reset_email, email_to, token)

async def send_password_reset_email(email_to: str, token: dict):
    context = {"token": token,} # Adicione o contexto real aqui

    template = env.get_template('password_reset.html')
    html_body = template.render(context)
    message = MessageSchema(
        subject='ParkinsonCheck - Redefinir Senha',
        recipients=[email_to],
        body=html_body,
        subtype=MessageType.html,
    )
    fm = FastMail(conf)
    await fm.send_message(message)