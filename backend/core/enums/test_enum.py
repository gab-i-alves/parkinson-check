from enum import Enum


class TestType(Enum):
    SPIRAL_TEST = 1
    VOICE_TEST = 2


class SpiralMethods(Enum):
    PAPER = 1
    WEBCAM = 2
