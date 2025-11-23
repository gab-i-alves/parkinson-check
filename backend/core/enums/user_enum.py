from enum import Enum


class UserType(Enum):
    PATIENT = 1
    DOCTOR = 2
    ADMIN = 3


class Gender(Enum):
    MALE = 1
    FEMALE = 2
    PREFER_NOT_TO_SAY = 3
