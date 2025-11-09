-- Migration: Add ADMIN type to type enum, and create its table
-- Date: 2025-11-01
-- Description: Adicionar ADMIN ao enum existente e criar a tabela de admin
ALTER TYPE user_type_enum ADD VALUE IF NOT EXISTS 'ADMIN';

CREATE TABLE IF NOT EXISTS "admin" (
  "id" integer PRIMARY KEY REFERENCES "user" ("id"),
  "is_superuser" boolean NOT NULL DEFAULT TRUE
);