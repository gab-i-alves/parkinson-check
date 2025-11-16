from enum import Enum

class DoctorStatus(str, Enum):
    PENDING = "pending"  
    APPROVED = "approved"  
    REJECTED = "rejected"  
    SUSPENDED = "suspended"  
    IN_REVIEW = "in_review"  

class ExperienceLevel(str, Enum):
    JUNIOR = "junior"  
    INTERMEDIATE = "intermediate"  
    SENIOR = "senior"  
    EXPERT = "expert"  
    
class DocumentType(str, Enum):
    CRM_CERTIFICATE = 'crm_certificate'
    DIPLOMA = 'diploma'
    IDENTITY = 'identity'
    CPF_DOCUMENT = 'cpf_document'
    PROOF_OF_ADDRESS = 'proof_of_address'
    OTHER = 'other'

class ActivityType(str, Enum):
    REGISTRATION = 'registration'
    LOGIN = 'login'
    STATUS_CHANGE = 'status_change'
    PATIENT_LINK = 'patient_link'
    TEST_CONDUCTED = 'test_conducted'
    NOTE_ADDED = 'note_added'
    PROFILE_UPDATE = 'profile_update'