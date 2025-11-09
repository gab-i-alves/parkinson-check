-- Script para adicionar a coluna share_data_for_statistics à tabela patient
-- Execute este script manualmente no banco de dados existente

ALTER TABLE patient
ADD COLUMN IF NOT EXISTS share_data_for_statistics BOOLEAN NOT NULL DEFAULT TRUE;

-- Comentário explicativo
COMMENT ON COLUMN patient.share_data_for_statistics IS
'Se o paciente permite que seus dados sejam usados em estatísticas agregadas do sistema';
