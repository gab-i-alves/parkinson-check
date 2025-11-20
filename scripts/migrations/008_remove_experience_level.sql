-- Migration: Remove experience_level column and enum
-- Date: 2025-11-18
-- Description: Remove experience_level column from doctor table and drop the enum type

-- Remove the column from doctor table
ALTER TABLE doctor
DROP COLUMN IF EXISTS experience_level;

-- Drop the enum type (only if no other tables use it)
DROP TYPE IF EXISTS experience_level_enum;
