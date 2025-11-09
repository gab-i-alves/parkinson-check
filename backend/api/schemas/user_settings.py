from pydantic import BaseModel


class PrivacySettingsSchema(BaseModel):
    """Schema para configurações de privacidade do paciente"""

    share_data_for_statistics: bool


class PrivacySettingsResponse(BaseModel):
    """Response com as configurações de privacidade atuais"""

    share_data_for_statistics: bool
