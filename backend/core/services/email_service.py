import resend
from fastapi import BackgroundTasks
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from jinja2 import Environment, FileSystemLoader

from infra.settings import settings

env = Environment(loader=FileSystemLoader(settings.EMAIL_TEMPLATES_PATH), autoescape=True)

# SMTP config for development
smtp_conf = None
if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
    smtp_conf = ConnectionConfig(
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

# Resend config for production
if settings.RESEND_API_KEY:
    resend.api_key = settings.RESEND_API_KEY


def is_production():
    return settings.ENVIRONMENT == "production"


async def send_email_smtp(email_to: str, subject: str, html_body: str):
    """Send email via SMTP (development)"""
    if not smtp_conf:
        raise ValueError("SMTP not configured. Check SMTP_HOST, SMTP_USER, SMTP_PASSWORD.")

    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        body=html_body,
        subtype=MessageType.html,
    )
    fm = FastMail(smtp_conf)
    await fm.send_message(message)


def send_email_resend(email_to: str, subject: str, html_body: str):
    """Send email via Resend API (production)"""
    if not settings.RESEND_API_KEY:
        raise ValueError("RESEND_API_KEY not configured.")

    resend.Emails.send({
        "from": f"ParkinsonCheck <{settings.RESEND_FROM_EMAIL}>",
        "to": [email_to],
        "subject": subject,
        "html": html_body,
    })


async def send_email(email_to: str, subject: str, html_body: str):
    """Send email using the appropriate method based on environment"""
    if is_production():
        send_email_resend(email_to, subject, html_body)
    else:
        await send_email_smtp(email_to, subject, html_body)


# Password Reset Email
async def send_password_reset_email_background(
    background_tasks: BackgroundTasks, email_to: str, token: str
):
    background_tasks.add_task(send_password_reset_email, email_to, token)


async def send_password_reset_email(email_to: str, token: str):
    reset_url = f"{settings.FRONTEND_URL}/auth/reset-password/{token}"
    context = {"reset_url": reset_url}

    template = env.get_template("password_reset.html")
    html_body = template.render(context)
    await send_email(email_to, "ParkinsonCheck - Redefinir Senha", html_body)


# Doctor Approval Email
async def send_doctor_approval_email_background(
    background_tasks: BackgroundTasks, email_to: str, doctor_name: str
):
    background_tasks.add_task(send_doctor_approval_email, email_to, doctor_name)


async def send_doctor_approval_email(email_to: str, doctor_name: str):
    context = {"doctor_name": doctor_name, "frontend_url": settings.FRONTEND_URL}

    template = env.get_template("doctor_approval.html")
    html_body = template.render(context)
    await send_email(email_to, "ParkinsonCheck - Cadastro Aprovado", html_body)


# Doctor Rejection Email
async def send_doctor_rejection_email_background(
    background_tasks: BackgroundTasks, email_to: str, doctor_name: str, reason: str
):
    background_tasks.add_task(send_doctor_rejection_email, email_to, doctor_name, reason)


async def send_doctor_rejection_email(email_to: str, doctor_name: str, reason: str):
    context = {"doctor_name": doctor_name, "reason": reason}

    template = env.get_template("doctor_rejection.html")
    html_body = template.render(context)
    await send_email(email_to, "ParkinsonCheck - Atualização de Cadastro", html_body)


# Doctor Status Change Email
async def send_doctor_status_change_email_background(
    background_tasks: BackgroundTasks, email_to: str, doctor_name: str, new_status: str, reason: str = None
):
    background_tasks.add_task(send_doctor_status_change_email, email_to, doctor_name, new_status, reason)


async def send_doctor_status_change_email(email_to: str, doctor_name: str, new_status: str, reason: str = None):
    context = {
        "doctor_name": doctor_name,
        "new_status": new_status,
        "reason": reason,
        "frontend_url": settings.FRONTEND_URL
    }

    template = env.get_template("doctor_status_change.html")
    html_body = template.render(context)
    await send_email(email_to, "ParkinsonCheck - Alteração de Status", html_body)
