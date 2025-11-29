-- =====================================================
-- Database Schema
-- =====================================================

-- =====================================================
-- 1. CUSTOM TYPES (ENUMS)
-- =====================================================

-- Tipo de usuário no sistema
CREATE TYPE user_type_enum AS ENUM ('PATIENT', 'DOCTOR', 'ADMIN');
COMMENT ON TYPE user_type_enum IS 'Define o tipo de usuário: PATIENT (paciente), DOCTOR (médico) ou ADMIN (administrador)';

-- Gênero do usuário
CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE', 'PREFER_NOT_TO_SAY');
COMMENT ON TYPE gender_enum IS 'Gênero do usuário: MALE (masculino), FEMALE (feminino), PREFER_NOT_TO_SAY (prefere não informar)';

-- Status do vínculo médico-paciente
CREATE TYPE bind_enum AS ENUM ('PENDING', 'ACTIVE', 'REVERSED', 'REJECTED');
COMMENT ON TYPE bind_enum IS 'Status do vínculo médico-paciente: PENDING (aguardando aprovação), ACTIVE (ativo/aprovado), REVERSED (desfeito por qualquer das partes), REJECTED (rejeitado por qualquer das partes)';

-- Tipo de teste de diagnóstico
CREATE TYPE test_type_enum AS ENUM ('SPIRAL_TEST', 'VOICE_TEST');
COMMENT ON TYPE test_type_enum IS 'Tipo de teste: SPIRAL_TEST (desenho de espiral), VOICE_TEST (análise de voz)';

-- Método de captura do teste de espiral
CREATE TYPE spiral_methods_enum AS ENUM ('WEBCAM', 'PAPER');
COMMENT ON TYPE spiral_methods_enum IS 'Método de captura da espiral: WEBCAM (tempo real via webcam), PAPER (foto de desenho em papel)';

-- Categoria de nota médica
CREATE TYPE note_category_enum AS ENUM ('OBSERVATION', 'RECOMMENDATION', 'ALERT');
COMMENT ON TYPE note_category_enum IS 'Categoria da nota: OBSERVATION (observação), RECOMMENDATION (recomendação), ALERT (alerta importante)';

-- Tipo de notificação
CREATE TYPE notification_type_enum AS ENUM ('BIND_REQUEST', 'BIND_ACCEPTED', 'BIND_REJECTED', 'BIND_REVERSED');
COMMENT ON TYPE notification_type_enum IS 'Tipo de notificação: BIND_REQUEST (solicitação de vínculo), BIND_ACCEPTED (vínculo aceito), BIND_REJECTED (vínculo rejeitado), BIND_REVERSED (vínculo desfeito)';

-- Status de aprovação do médico
CREATE TYPE doctor_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'IN_REVIEW');
COMMENT ON TYPE doctor_status_enum IS 'Status de aprovação do médico no sistema';

-- Tipo de documento enviado pelo médico
CREATE TYPE document_type_enum AS ENUM ('CRM_CERTIFICATE', 'DIPLOMA', 'IDENTITY', 'PROOF_OF_ADDRESS');
COMMENT ON TYPE document_type_enum IS 'Tipo de documento: CRM_CERTIFICATE (certificado CRM do médico), DIPLOMA (diploma de medicina), IDENTITY (documento de identidade RG ou CNH), PROOF_OF_ADDRESS (comprovante de endereço)';

-- =====================================================
-- 2. TABLES
-- =====================================================

-- -----------------------------------------------------
-- Tabela: address
-- -----------------------------------------------------
-- Armazena endereços físicos dos usuários
CREATE TABLE IF NOT EXISTS "address" (
  "id" SERIAL PRIMARY KEY,
  "cep" CHAR(8),
  "street" VARCHAR(100),
  "number" VARCHAR(10),
  "complement" VARCHAR(50),
  "neighborhood" VARCHAR(50),
  "city" VARCHAR(100),
  "state" VARCHAR(20),
  -- Campos de auditoria
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ DEFAULT NULL
);

COMMENT ON TABLE "address" IS 'Endereços físicos dos usuários do sistema';
COMMENT ON COLUMN "address"."cep" IS 'CEP brasileiro (8 dígitos)';
COMMENT ON COLUMN "address"."deleted_at" IS 'Soft delete: data de remoção lógica do registro';

-- -----------------------------------------------------
-- Tabela: user
-- -----------------------------------------------------
-- Tabela base para todos os usuários (herança table-per-type)
CREATE TABLE IF NOT EXISTS "user" (
  "id" SERIAL PRIMARY KEY,
  "type" user_type_enum NOT NULL,
  "name" VARCHAR(50) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "hashed_password" VARCHAR(255) NOT NULL,
  "cpf" CHAR(11) UNIQUE NOT NULL,
  "birthdate" DATE NOT NULL,
  "gender" gender_enum NOT NULL,
  "address_id" INTEGER NOT NULL REFERENCES "address" ("id") ON DELETE SET NULL,
  -- Recuperação de senha
  "reset_token" VARCHAR(255) DEFAULT NULL,
  "reset_token_expiry" TIMESTAMPTZ DEFAULT NULL,
  -- Controle de acesso
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  -- Campos de auditoria
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ DEFAULT NULL,

  -- Validações
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_cpf CHECK (cpf ~ '^\d{11}$'),
  CONSTRAINT valid_birthdate CHECK (birthdate <= CURRENT_DATE AND birthdate >= '1900-01-01')
);

COMMENT ON TABLE "user" IS 'Tabela base de usuários (pacientes, médicos e administradores) - padrão de herança table-per-type';
COMMENT ON COLUMN "user"."type" IS 'Tipo de usuário: PATIENT ou DOCTOR';
COMMENT ON COLUMN "user"."cpf" IS 'CPF brasileiro (11 dígitos) - DADO SENSÍVEL LGPD';
COMMENT ON COLUMN "user"."hashed_password" IS 'Senha criptografada com hash (bcrypt/argon2)';
COMMENT ON COLUMN "user"."reset_token" IS 'Token temporário para recuperação de senha';
COMMENT ON COLUMN "user"."is_active" IS 'Indica se o usuário está ativo no sistema';
COMMENT ON COLUMN "user"."deleted_at" IS 'Soft delete: data de remoção lógica do usuário';

-- -----------------------------------------------------
-- Tabela: patient
-- -----------------------------------------------------
-- Extensão de usuário para pacientes
CREATE TABLE IF NOT EXISTS "patient" (
  "id" INTEGER PRIMARY KEY REFERENCES "user" ("id") ON DELETE CASCADE,
  "share_data_for_statistics" BOOLEAN NOT NULL DEFAULT TRUE,
  -- Campos de auditoria
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "patient" IS 'Dados específicos de pacientes (extends user)';
COMMENT ON COLUMN "patient"."share_data_for_statistics" IS 'Consentimento LGPD: permite uso de dados anonimizados para pesquisa';

-- -----------------------------------------------------
-- Tabela: admin
-- -----------------------------------------------------
-- Extensão de usuário para administradores
CREATE TABLE IF NOT EXISTS "admin" (
  "id" INTEGER PRIMARY KEY REFERENCES "user" ("id") ON DELETE CASCADE,
  "is_superuser" BOOLEAN NOT NULL DEFAULT TRUE,
  -- Campos de auditoria
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "admin" IS 'Dados específicos de administradores do sistema (extends user)';
COMMENT ON COLUMN "admin"."is_superuser" IS 'Indica se possui privilégios de superusuário';

-- -----------------------------------------------------
-- Tabela: user_status_audit
-- -----------------------------------------------------
-- Registra histórico de mudanças de status de usuários
CREATE TABLE IF NOT EXISTS "user_status_audit" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
  "changed_by_admin_id" INTEGER NOT NULL REFERENCES "admin" ("id") ON DELETE SET NULL,
  "is_active" BOOLEAN NOT NULL,
  "reason" TEXT,
  "changed_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "user_status_audit" IS 'Auditoria de mudanças de status (ativo/inativo) dos usuários';
COMMENT ON COLUMN "user_status_audit"."user_id" IS 'ID do usuário que teve o status alterado';
COMMENT ON COLUMN "user_status_audit"."changed_by_admin_id" IS 'ID do administrador que realizou a alteração';
COMMENT ON COLUMN "user_status_audit"."is_active" IS 'Novo status do usuário após a mudança';
COMMENT ON COLUMN "user_status_audit"."reason" IS 'Motivo da alteração de status (especialmente importante para desativações)';
COMMENT ON COLUMN "user_status_audit"."changed_at" IS 'Data e hora da alteração de status';

-- Índices para melhor performance em consultas de auditoria
CREATE INDEX IF NOT EXISTS idx_user_status_audit_user_id ON "user_status_audit" ("user_id");
CREATE INDEX IF NOT EXISTS idx_user_status_audit_changed_at ON "user_status_audit" ("changed_at" DESC);

-- -----------------------------------------------------
-- Tabela: doctor
-- -----------------------------------------------------
-- Extensão de usuário para médicos
CREATE TABLE IF NOT EXISTS "doctor" (
  "id" INTEGER PRIMARY KEY REFERENCES "user" ("id") ON DELETE CASCADE,
  "crm" VARCHAR(10) UNIQUE NOT NULL,
  "expertise_area" VARCHAR(50),
  "status" doctor_status_enum NOT NULL DEFAULT 'PENDING',
  "approval_date" TIMESTAMPTZ,
  "rejection_reason" VARCHAR(255),
  "approved_by_admin_id" INTEGER REFERENCES "admin"(id),
  -- Campos de auditoria
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Validações
  CONSTRAINT valid_crm_format CHECK (crm ~ '^\d{5,6}/[A-Z]{2}$'),
  CONSTRAINT valid_crm_state CHECK (
    SUBSTRING(crm FROM '/([A-Z]{2})$') IN (
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
      'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
      'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    )
  )
);

COMMENT ON TABLE "doctor" IS 'Dados específicos de médicos (extends user)';
COMMENT ON COLUMN "doctor"."crm" IS 'CRM no formato NNNNNN/UF (ex: 123456/SP) - DADO SENSÍVEL LGPD';
COMMENT ON COLUMN "doctor"."expertise_area" IS 'Área de especialização médica';
COMMENT ON COLUMN "doctor"."status" IS 'Status de aprovação do médico no sistema';
COMMENT ON COLUMN "doctor"."approval_date" IS 'Data de aprovação do médico';
COMMENT ON COLUMN "doctor"."rejection_reason" IS 'Motivo da rejeição do cadastro';

-- -----------------------------------------------------
-- Tabela: bind
-- -----------------------------------------------------
-- Gerencia vínculos entre médicos e pacientes
CREATE TABLE IF NOT EXISTS "bind" (
    "id" SERIAL PRIMARY KEY,
    "status" bind_enum NOT NULL,
    "doctor_id" INTEGER NOT NULL REFERENCES "doctor"(id) ON DELETE CASCADE,
    "patient_id" INTEGER NOT NULL REFERENCES "patient"(id) ON DELETE CASCADE,
    "created_by_type" user_type_enum NOT NULL DEFAULT 'PATIENT',
    "message" TEXT NULL,
    -- Campos de auditoria
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "deleted_at" TIMESTAMPTZ DEFAULT NULL,

    -- Constraint: apenas um vínculo ativo por par médico-paciente
    CONSTRAINT unique_doctor_patient UNIQUE(doctor_id, patient_id)
);

COMMENT ON TABLE "bind" IS 'Vínculos entre médicos e pacientes (relacionamento muitos-para-muitos gerenciado)';
COMMENT ON COLUMN "bind"."created_by_type" IS 'Indica quem iniciou o vínculo: PATIENT (paciente) ou DOCTOR (médico)';
COMMENT ON COLUMN "bind"."message" IS 'Mensagem opcional na solicitação de vínculo';
COMMENT ON CONSTRAINT unique_doctor_patient ON "bind" IS 'Garante apenas um vínculo por par médico-paciente (evita duplicatas)';

-- -----------------------------------------------------
-- Tabela: test
-- -----------------------------------------------------
-- Tabela base para testes de diagnóstico (herança table-per-type)
CREATE TABLE IF NOT EXISTS "test" (
  "id" SERIAL PRIMARY KEY,
  "patient_id" INTEGER NOT NULL REFERENCES "patient"(id) ON DELETE CASCADE,
  "execution_date" TIMESTAMPTZ NOT NULL,
  "score" REAL NOT NULL,
  "type" test_type_enum NOT NULL,
  -- Campos de auditoria
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ DEFAULT NULL,

  -- Validações
  CONSTRAINT valid_score CHECK (score >= 0 AND score <= 1)
);

COMMENT ON TABLE "test" IS 'Tabela base de testes de diagnóstico de Parkinson (voice_test e spiral_test)';
COMMENT ON COLUMN "test"."score" IS 'Probability of being HEALTHY (0.0-1.0): Higher score = Healthier patient - DADO DE SAÚDE';
COMMENT ON COLUMN "test"."execution_date" IS 'Data e hora de execução do teste';
COMMENT ON COLUMN "test"."deleted_at" IS 'Soft delete: data de remoção lógica do teste';

-- -----------------------------------------------------
-- Tabela: voice_test
-- -----------------------------------------------------
-- Teste de análise de voz para detecção de Parkinson
CREATE TABLE IF NOT EXISTS "voice_test" (
  "id" INTEGER PRIMARY KEY REFERENCES "test" ("id") ON DELETE CASCADE,
  "record_duration" REAL NOT NULL,
  "voice_audio_data" BYTEA DEFAULT NULL,
  "voice_audio_filename" VARCHAR(255) DEFAULT NULL,
  "voice_audio_content_type" VARCHAR(100) DEFAULT NULL,
  "raw_parkinson_probability" REAL DEFAULT NULL,

  -- Validações
  CONSTRAINT positive_record_duration CHECK (record_duration > 0),
  CONSTRAINT valid_raw_probability CHECK (raw_parkinson_probability IS NULL OR (raw_parkinson_probability >= 0 AND raw_parkinson_probability <= 1))
);

COMMENT ON TABLE "voice_test" IS 'Teste de voz para diagnóstico de Parkinson (extends test)';
COMMENT ON COLUMN "voice_test"."record_duration" IS 'Duração da gravação em segundos';
COMMENT ON COLUMN "voice_test"."voice_audio_data" IS 'Dados binários do áudio - DADO DE SAÚDE';
COMMENT ON COLUMN "voice_test"."voice_audio_filename" IS 'Nome do arquivo de áudio original';
COMMENT ON COLUMN "voice_test"."raw_parkinson_probability" IS 'Probabilidade original de Parkinson retornada pelo modelo (0.0-1.0)';

-- -----------------------------------------------------
-- Tabela: spiral_test
-- -----------------------------------------------------
-- Teste de desenho de espiral para detecção de Parkinson
CREATE TABLE IF NOT EXISTS "spiral_test" (
  "id" INTEGER PRIMARY KEY REFERENCES "test" ("id") ON DELETE CASCADE,
  "draw_duration" REAL NOT NULL,
  "method" spiral_methods_enum NOT NULL,
  "spiral_image_data" BYTEA DEFAULT NULL,
  "spiral_image_filename" VARCHAR(255) DEFAULT NULL,
  "spiral_image_content_type" VARCHAR(100) DEFAULT NULL,
  "model_predictions" JSONB DEFAULT NULL,
  "avg_parkinson_probability" REAL DEFAULT NULL,
  "majority_vote" VARCHAR(20) DEFAULT NULL,
  "healthy_votes" INTEGER DEFAULT NULL,
  "parkinson_votes" INTEGER DEFAULT NULL,

  -- Características extraídas da imagem (features usadas pelo modelo de ML)
  "feature_area" REAL DEFAULT NULL,
  "feature_perimeter" REAL DEFAULT NULL,
  "feature_circularity" REAL DEFAULT NULL,
  "feature_aspect_ratio" REAL DEFAULT NULL,
  "feature_entropy" REAL DEFAULT NULL,
  "feature_mean_thickness" REAL DEFAULT NULL,
  "feature_std_thickness" REAL DEFAULT NULL,

  -- Validações
  CONSTRAINT positive_draw_duration CHECK (draw_duration > 0),
  CONSTRAINT valid_avg_probability CHECK (avg_parkinson_probability IS NULL OR (avg_parkinson_probability >= 0 AND avg_parkinson_probability <= 1)),
  CONSTRAINT valid_votes CHECK (
    (healthy_votes IS NULL AND parkinson_votes IS NULL) OR
    (healthy_votes >= 0 AND parkinson_votes >= 0)
  )
);

COMMENT ON TABLE "spiral_test" IS 'Teste de desenho de espiral para diagnóstico de Parkinson (extends test)';
COMMENT ON COLUMN "spiral_test"."draw_duration" IS 'Duração do desenho em segundos';
COMMENT ON COLUMN "spiral_test"."method" IS 'Método de captura: WEBCAM (tempo real) ou PAPER (foto de papel)';
COMMENT ON COLUMN "spiral_test"."spiral_image_data" IS 'Dados binários da imagem - DADO DE SAÚDE';
COMMENT ON COLUMN "spiral_test"."model_predictions" IS 'Previsões individuais dos 11 modelos em formato JSON - DADO DE SAÚDE';
COMMENT ON COLUMN "spiral_test"."avg_parkinson_probability" IS 'Média das probabilidades de Parkinson de todos os modelos (0.0-1.0)';
COMMENT ON COLUMN "spiral_test"."majority_vote" IS 'Decisão por voto majoritário: HEALTHY ou PARKINSON';
COMMENT ON COLUMN "spiral_test"."healthy_votes" IS 'Quantidade de modelos que classificaram como Healthy';
COMMENT ON COLUMN "spiral_test"."parkinson_votes" IS 'Quantidade de modelos que classificaram como Parkinson';
COMMENT ON COLUMN "spiral_test"."feature_area" IS 'Área do contorno principal da espiral (pixels²)';
COMMENT ON COLUMN "spiral_test"."feature_perimeter" IS 'Perímetro do contorno principal (pixels)';
COMMENT ON COLUMN "spiral_test"."feature_circularity" IS 'Circularidade: 4π×área/perímetro² (0-1, 1=círculo perfeito)';
COMMENT ON COLUMN "spiral_test"."feature_aspect_ratio" IS 'Razão de aspecto: largura/altura do bounding box';
COMMENT ON COLUMN "spiral_test"."feature_entropy" IS 'Entropia da imagem (medida de complexidade/irregularidade)';
COMMENT ON COLUMN "spiral_test"."feature_mean_thickness" IS 'Espessura média do traçado (pixels)';
COMMENT ON COLUMN "spiral_test"."feature_std_thickness" IS 'Desvio padrão da espessura do traçado (pixels)';

-- -----------------------------------------------------
-- Tabela: note
-- -----------------------------------------------------
-- Notas médicas sobre testes de pacientes
CREATE TABLE IF NOT EXISTS "note" (
  "id" SERIAL PRIMARY KEY,
  "content" TEXT NOT NULL,
  "patient_view" BOOLEAN NOT NULL,
  "category" note_category_enum NOT NULL DEFAULT 'OBSERVATION',
  "test_id" INTEGER NOT NULL REFERENCES "test" ("id") ON DELETE CASCADE,
  "doctor_id" INTEGER NOT NULL REFERENCES "doctor" ("id") ON DELETE CASCADE,
  "parent_note_id" INTEGER DEFAULT NULL REFERENCES "note" ("id") ON DELETE CASCADE,
  -- Campos de auditoria
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ DEFAULT NULL
);

COMMENT ON TABLE "note" IS 'Anotações médicas sobre testes de pacientes (suporta threads via parent_note_id)';
COMMENT ON COLUMN "note"."content" IS 'Conteúdo da nota médica - DADO DE SAÚDE';
COMMENT ON COLUMN "note"."patient_view" IS 'Define se o paciente pode visualizar esta nota';
COMMENT ON COLUMN "note"."parent_note_id" IS 'ID da nota pai (para threads de comentários)';
COMMENT ON COLUMN "note"."deleted_at" IS 'Soft delete: data de remoção lógica da nota';

-- -----------------------------------------------------
-- Tabela: notification
-- -----------------------------------------------------
-- Notificações do sistema para usuários
CREATE TABLE IF NOT EXISTS "notification" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
  "message" VARCHAR(255) NOT NULL,
  "type" notification_type_enum NOT NULL,
  "bind_id" INTEGER DEFAULT NULL,
  "read" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- Tabela: doctor_document
-- -----------------------------------------------------
-- Armazena documentos enviados pelos médicos para verificação
CREATE TABLE IF NOT EXISTS "doctor_document" (
  "id" SERIAL PRIMARY KEY,
  "doctor_id" INTEGER NOT NULL REFERENCES "doctor" ("id"),
  "document_type" document_type_enum NOT NULL DEFAULT 'CRM_CERTIFICATE',
  "file_name" VARCHAR(255) NOT NULL,
  "file_data" BYTEA NOT NULL,
  "file_size" INTEGER NOT NULL,  -- em bytes
  "mime_type" VARCHAR(100) NOT NULL,
  "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "verified" BOOLEAN NOT NULL DEFAULT FALSE,
  "verified_by_admin_id" INTEGER REFERENCES "admin" ("id"),
  "verified_at" TIMESTAMPTZ
);

COMMENT ON TABLE "doctor_document" IS 'Documentos enviados pelos médicos para verificação';
COMMENT ON COLUMN "doctor_document"."document_type" IS 'Tipo de documento enviado';
COMMENT ON COLUMN "doctor_document"."file_data" IS 'Dados binários do documento';
COMMENT ON COLUMN "doctor_document"."verified" IS 'Indica se o documento foi verificado por um administrador';


-- =====================================================
-- 3. INDEXES FOR PERFORMANCE
-- =====================================================

-- Índices para tabela user
CREATE INDEX idx_user_type ON "user"(type);
CREATE INDEX idx_user_is_active ON "user"(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_user_reset_token ON "user"(reset_token) WHERE reset_token IS NOT NULL;
CREATE INDEX idx_user_not_deleted ON "user"(id) WHERE deleted_at IS NULL;

-- Índices para tabela bind (crítico para dashboards de médicos)
CREATE INDEX idx_bind_doctor_id ON bind(doctor_id);
CREATE INDEX idx_bind_patient_id ON bind(patient_id);
CREATE INDEX idx_bind_status ON bind(status);
CREATE INDEX idx_bind_composite ON bind(doctor_id, patient_id, status);
CREATE INDEX idx_bind_not_deleted ON bind(id) WHERE deleted_at IS NULL;

-- Índices para tabela test (consultas frequentes de histórico)
CREATE INDEX idx_test_patient_id ON test(patient_id);
CREATE INDEX idx_test_type ON test(type);
CREATE INDEX idx_test_execution_date ON test(execution_date DESC);
CREATE INDEX idx_test_patient_date ON test(patient_id, execution_date DESC);
CREATE INDEX idx_test_not_deleted ON test(id) WHERE deleted_at IS NULL;

-- Índices para tabela note
CREATE INDEX idx_note_test_id ON note(test_id);
CREATE INDEX idx_note_doctor_id ON note(doctor_id);
CREATE INDEX idx_note_parent_note_id ON note(parent_note_id) WHERE parent_note_id IS NOT NULL;
CREATE INDEX idx_note_not_deleted ON note(id) WHERE deleted_at IS NULL;

-- Índices para tabela notification
CREATE INDEX idx_notification_user_unread ON notification(user_id, read, created_at DESC);
CREATE INDEX idx_notification_user_id ON notification(user_id, created_at DESC);

-- =====================================================
-- 4. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Função para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Atualiza automaticamente o campo updated_at com timestamp atual';

-- Triggers para tabela user
DROP TRIGGER IF EXISTS update_table_updated_at ON "user";
CREATE TRIGGER update_table_updated_at
BEFORE UPDATE ON "user"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Triggers para tabela address
DROP TRIGGER IF EXISTS update_address_updated_at ON "address";
CREATE TRIGGER update_address_updated_at
BEFORE UPDATE ON "address"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Triggers para tabela patient
DROP TRIGGER IF EXISTS update_patient_updated_at ON "patient";
CREATE TRIGGER update_patient_updated_at
BEFORE UPDATE ON "patient"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Triggers para tabela admin
DROP TRIGGER IF EXISTS update_admin_updated_at ON "admin";
CREATE TRIGGER update_admin_updated_at
BEFORE UPDATE ON "admin"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Triggers para tabela doctor
DROP TRIGGER IF EXISTS update_doctor_updated_at ON "doctor";
CREATE TRIGGER update_doctor_updated_at
BEFORE UPDATE ON "doctor"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Triggers para tabela bind
DROP TRIGGER IF EXISTS update_bind_updated_at ON "bind";
CREATE TRIGGER update_bind_updated_at
BEFORE UPDATE ON "bind"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Triggers para tabela test
DROP TRIGGER IF EXISTS update_test_updated_at ON "test";
CREATE TRIGGER update_test_updated_at
BEFORE UPDATE ON "test"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Triggers para tabela note
DROP TRIGGER IF EXISTS update_note_updated_at ON "note";
CREATE TRIGGER update_note_updated_at
BEFORE UPDATE ON "note"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();