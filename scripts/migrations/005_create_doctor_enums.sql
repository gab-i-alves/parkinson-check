-- Migration: Add doctor relative enums
-- Date: 2025-11-15
-- Description: Adicionar os enums sobre operações e informações dos médicos
CREATE TYPE doctor_status_enum AS ENUM (
  'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'IN_REVIEW'
);
CREATE TYPE experience_level_enum AS ENUM (
  'JUNIOR', 'INTERMEDIATE', 'SENIOR', 'EXPERT'
);
CREATE TYPE document_type_enum AS ENUM (
  'crm_certificate', 'diploma', 'identity', 'cpf_document', 'proof_of_address', 'other'
);
CREATE TYPE activity_type_enum AS ENUM (
  'registration', 'login', 'status_change', 'patient_link', 'test_conducted', 'note_added', 'profile_update'
);

ALTER TABLE doctor
DROP COLUMN "status_approval",
ADD COLUMN IF NOT EXISTS "status" doctor_status_enum NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "experience_level" experience_level_enum NOT NULL DEFAULT 'JUNIOR',
ADD COLUMN IF NOT EXISTS "approval_date" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "rejection_reason" varchar(50),
ADD COLUMN IF NOT EXISTS "approved_by_admin_id" INTEGER REFERENCES "admin"(id);