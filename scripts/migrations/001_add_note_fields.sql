-- Migration: Add category, created_at, and updated_at to note table
-- Date: 2025-10-20
-- Description: Adiciona campos de categoria e timestamps às notas médicas (HU012)

-- 1. Criar enum de categoria de nota
DO $$ BEGIN
    CREATE TYPE note_category_enum AS ENUM ('OBSERVATION', 'RECOMMENDATION', 'ALERT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Adicionar coluna category (com valor padrão para notas existentes)
ALTER TABLE note
ADD COLUMN IF NOT EXISTS category note_category_enum NOT NULL DEFAULT 'OBSERVATION';

-- 3. Adicionar coluna created_at (com valor padrão NOW() para notas existentes)
ALTER TABLE note
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 4. Adicionar coluna updated_at (com valor padrão NOW() para notas existentes)
ALTER TABLE note
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 5. Criar trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_note_updated_at ON note;

CREATE TRIGGER update_note_updated_at
BEFORE UPDATE ON note
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Verificar que a migration foi aplicada
SELECT
    'Migration 001_add_note_fields.sql aplicada com sucesso!' AS status,
    COUNT(*) AS total_notes
FROM note;
