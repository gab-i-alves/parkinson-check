from enum import Enum


class TestStatus(Enum):
    DONE = 1
    VIEWED = 2
    NOTED = 3
    REJECTED = 4


class TestType(Enum):
    SPIRAL_TEST = 1
    VOICE_TEST = 2


class SpiralMethods(Enum):
    PAPER = 1
    WEBCAM = 2
