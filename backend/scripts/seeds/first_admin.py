#!/usr/bin/env python3
"""
Script para criar o primeiro admin do sistema.
Uso: python scripts/seed_admin.py
"""
from sqlalchemy import create_engine, literal
from sqlalchemy.orm import Session
from core.models import Admin, UserType # Adicionar UserType
from core.enums import Gender
from core.security.security import get_password_hash
from infra.settings import Settings
from datetime import date # Adicionar date

def create_first_admin():
    settings = Settings()
    engine = create_engine(settings.DATABASE_URL)
    session = Session(engine)

    admin_exists = session.query(Admin).filter(Admin.id == 1).first is not None

    if not admin_exists:
        admin = Admin(
            name="Administrador",
            email="pcheck.noreply@gmail.com",
            cpf="00000000000",
            birthdate=date(1990, 1, 1),
            gender=Gender.PREFER_NOT_TO_SAY,
            hashed_password=get_password_hash("Admin@123"),
            user_type=UserType.ADMIN,
            is_superuser=True,
            address_id=1  # Assumindo que endereço com ID 1 existe
        )

        session.add(admin)
        session.commit()
        print("Admin criado com sucesso!")
        print("Email: pcheck.noreply@gmail.com")
        print("Senha: Admin@123")
        print("IMPORTANTE: Altere a senha após o primeiro login!")
    else:
        print("Já existe o primeiro administrador")

if __name__ == "__main__":
    create_first_admin()