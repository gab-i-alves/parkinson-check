from fastapi import BackgroundTasks
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from jinja2 import Environment, FileSystemLoader

from infra.settings import settings

env = Environment(loader=FileSystemLoader(settings.EMAIL_TEMPLATES_PATH), autoescape=True)

conf = ConnectionConfig(
    MAIL_USERNAME=settings.SMTP_USER,
    MAIL_PASSWORD=settings.SMTP_PASSWORD,
    MAIL_PORT=settings.SMTP_PORT,
    MAIL_SERVER=settings.SMTP_HOST,
    USE_CREDENTIALS=True,
    TEMPLATE_FOLDER=settings.EMAIL_TEMPLATES_PATH,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    MAIL_FROM=settings.SMTP_USER,
)


async def send_password_reset_email_background(
    background_tasks: BackgroundTasks, email_to: str, token: str
):
    background_tasks.add_task(send_password_reset_email, email_to, token)


async def send_password_reset_email(email_to: str, token: str):
    context = {"token": token}

    template = env.get_template("password_reset.html")
    html_body = template.render(context)
    message = MessageSchema(
        subject="ParkinsonCheck - Redefinir Senha",
        recipients=[email_to],
        body=html_body,
        subtype=MessageType.html,
    )
    fm = FastMail(conf)
    await fm.send_message(message)


async def send_doctor_approval_email_background(
    background_tasks: BackgroundTasks, email_to: str, doctor_name: str
):
    background_tasks.add_task(send_doctor_approval_email, email_to, doctor_name)


async def send_doctor_approval_email(email_to: str, doctor_name: str):
    context = {"doctor_name": doctor_name}

    template = env.get_template("doctor_approval.html")
    html_body = template.render(context)
    message = MessageSchema(
        subject="ParkinsonCheck - Cadastro Aprovado",
        recipients=[email_to],
        body=html_body,
        subtype=MessageType.html,
    )
    fm = FastMail(conf)
    await fm.send_message(message)


async def send_doctor_rejection_email_background(
    background_tasks: BackgroundTasks, email_to: str, doctor_name: str, reason: str
):
    background_tasks.add_task(send_doctor_rejection_email, email_to, doctor_name, reason)


async def send_doctor_rejection_email(email_to: str, doctor_name: str, reason: str):
    context = {"doctor_name": doctor_name, "reason": reason}

    template = env.get_template("doctor_rejection.html")
    html_body = template.render(context)
    message = MessageSchema(
        subject="ParkinsonCheck - Atualização de Cadastro",
        recipients=[email_to],
        body=html_body,
        subtype=MessageType.html,
    )
    fm = FastMail(conf)
    await fm.send_message(message)


async def send_doctor_status_change_email_background(
    background_tasks: BackgroundTasks, email_to: str, doctor_name: str, new_status: str, reason: str = None
):
    background_tasks.add_task(send_doctor_status_change_email, email_to, doctor_name, new_status, reason)


async def send_doctor_status_change_email(email_to: str, doctor_name: str, new_status: str, reason: str = None):
    context = {
        "doctor_name": doctor_name,
        "new_status": new_status,
        "reason": reason
    }

    template = env.get_template("doctor_status_change.html")
    html_body = template.render(context)
    message = MessageSchema(
        subject="ParkinsonCheck - Alteração de Status",
        recipients=[email_to],
        body=html_body,
        subtype=MessageType.html,
    )
    fm = FastMail(conf)
    await fm.send_message(message)
