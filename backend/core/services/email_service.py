from fastapi import BackgroundTasks
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

from backend.infra.settings import Settings

conf = ConnectionConfig(
    MAIL_USERNAME=Settings().SMTP_USER,
    MAIL_PASSWORD=Settings().SMTP_PASSWORD,
    MAIL_PORT=Settings().SMTP_PORT,
    MAIL_SERVER=Settings().SMTP_HOST,
    MAIL_TLS=True,
    MAIL_SSL=False,
    USE_CREDENTIALS=True,
    TEMPLATE_FOLDER='./templates/email'
)

def send_email_background(background_tasks: BackgroundTasks, subject: str, email_to: str, body: dict):
    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        body=body,
        subtype='html',
    )
    fm = FastMail(conf)
    background_tasks.add_task(
       fm.send_message, message, template_name='email.html')