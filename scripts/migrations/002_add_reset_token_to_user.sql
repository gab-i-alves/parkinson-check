-- Migration: Add reset_token and reset_token_expiry to user table
-- Date: 2025-10-22
-- Description: Adiciona campos referentes ao token de redefinição de senha

-- Adiciona a coluna 'reset_token' (string, permite nulo)
ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL;

-- Adiciona a coluna 'reset_token_expiry' (timestamp with timezone, permite nulo)
ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP WITH TIME ZONE NULL;


-- Verificar que a migration foi aplicada
SELECT
    'Migration 002_add_reset_token_to_users.sql aplicada com sucesso!' AS status,
    COUNT(*) AS total_users
FROM user;
