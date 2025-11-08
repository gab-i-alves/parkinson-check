-- Migration: Add created_by_type column to bind table
-- This column tracks who initiated the binding request (PATIENT or DOCTOR)

-- Add the column with a default value
ALTER TABLE bind
ADD COLUMN IF NOT EXISTS created_by_type user_type_enum NOT NULL DEFAULT 'PATIENT';

-- Update existing records:
-- Since we can't determine who created existing bindings, we'll set a default
-- New bindings will have this field set correctly by the application
UPDATE bind
SET created_by_type = 'PATIENT'
WHERE created_by_type IS NULL;

-- Note: For existing records, you may need to manually update based on your business logic
-- or accept that old records will have the default value
