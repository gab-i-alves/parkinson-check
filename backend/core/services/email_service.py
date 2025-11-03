from fastapi import BackgroundTasks
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from jinja2 import Environment, FileSystemLoader

from infra.settings import settings

env = Environment(
    loader=FileSystemLoader(settings.EMAIL_TEMPLATES_PATH),
    autoescape=True
)

conf = ConnectionConfig(
    MAIL_USERNAME=settings.SMTP_USER,
    MAIL_PASSWORD=settings.SMTP_PASSWORD,
    MAIL_PORT=settings.SMTP_PORT,
    MAIL_SERVER=settings.SMTP_HOST,
    USE_CREDENTIALS=True,
    TEMPLATE_FOLDER=settings.EMAIL_TEMPLATES_PATH,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    MAIL_FROM=settings.SMTP_USER
)

        

async def send_password_reset_email_background(background_tasks: BackgroundTasks, email_to: str, token: str):
        background_tasks.add_task(send_password_reset_email, email_to, token)

async def send_password_reset_email(email_to: str, token: str):
    context = {"token": token}

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
