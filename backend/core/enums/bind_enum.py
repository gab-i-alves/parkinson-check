from enum import Enum


class BindEnum(str, Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    REVERSED = "REVERSED"
    REJECTED = "REJECTED"
