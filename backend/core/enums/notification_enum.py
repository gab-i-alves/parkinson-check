from enum import Enum


class NotificationType(str, Enum):
    BIND_REQUEST = "BIND_REQUEST"
    BIND_ACCEPTED = "BIND_ACCEPTED"
    BIND_REJECTED = "BIND_REJECTED"
