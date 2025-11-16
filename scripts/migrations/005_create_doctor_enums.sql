-- Migration: Add doctor relative enums
-- Date: 2025-11-15
-- Description: Adicionar os enums sobre operações e informações dos médicos
CREATE TYPE doctor_status_enum AS ENUM (
  'pending', 'approved', 'rejected', 'suspended', 'in_review'
);
CREATE TYPE experience_level_enum AS ENUM (
  'junior', 'intermediate', 'senior', 'expert'
);
CREATE TYPE document_type_enum AS ENUM (
  'crm_certificate', 'diploma', 'identity', 'cpf_document', 'proof_of_address', 'other'
);
CREATE TYPE activity_type_enum AS ENUM (
  'registration', 'login', 'status_change', 'patient_link', 'test_conducted', 'note_added', 'profile_update'
);