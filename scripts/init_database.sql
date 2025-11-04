CREATE TYPE user_type_enum AS ENUM ('PATIENT', 'DOCTOR');

CREATE TYPE bind_enum AS ENUM ('PENDING', 'ACTIVE', 'REVERSED', 'REJECTED');

CREATE TYPE test_status_enum AS ENUM ('DONE', 'VIEWED', 'NOTED');

CREATE TYPE test_type_enum AS ENUM ('SPIRAL_TEST', 'VOICE_TEST');

CREATE TYPE spiral_methods_enum AS ENUM ('WEBCAM', 'PAPER');

CREATE TYPE note_category_enum AS ENUM ('OBSERVATION', 'RECOMMENDATION', 'ALERT');

CREATE TYPE notification_type_enum AS ENUM ('BIND_REQUEST', 'BIND_ACCEPTED', 'BIND_REJECTED');

CREATE TABLE IF NOT EXISTS "address" (
  "id" SERIAL PRIMARY KEY,
  "cep" char(8),
  "street" varchar(100),
  "number" varchar(10),
  "complement" varchar(50),
  "neighborhood" varchar(50),
  "city" varchar(100),
  "state" varchar(20)
);

CREATE TABLE IF NOT EXISTS "user" (
  "id" SERIAL PRIMARY KEY,
  "type" user_type_enum NOT NULL,
  "name" varchar(50) NOT NULL,
  "email" varchar(255) UNIQUE NOT NULL,
  "hashed_password" varchar(255) NOT NULL,
  "cpf" char(11) UNIQUE NOT NULL,
  "birthdate" TIMESTAMP NOT NULL,
  "address_id" integer NOT NULL REFERENCES "address" ("id"),
  "is_active" boolean NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  "reset_token" varchar(255) DEFAULT NULL,
  "reset_token_expiry" TIMESTAMPTZ DEFAULT NULL
);


CREATE TABLE IF NOT EXISTS "patient" (
  "id" integer PRIMARY KEY  REFERENCES "user" ("id")
);

CREATE TABLE IF NOT EXISTS "doctor" (
  "id" integer PRIMARY KEY  REFERENCES "user" ("id"),
  "crm" char(8) UNIQUE NOT NULL,
  "expertise_area" varchar(50),
  "status_approval" boolean
);

CREATE TABLE IF NOT EXISTS "bind" (
    "id" SERIAL PRIMARY KEY,
    "status" bind_enum NOT NULL,
    "doctor_id" INTEGER NOT NULL REFERENCES "doctor"(id),
    "patient_id" INTEGER NOT NULL REFERENCES "patient"(id)
);

CREATE TABLE IF NOT EXISTS "test" (
  "id" SERIAL PRIMARY KEY,
  "patient_id" integer NOT NULL,
  "execution_date" TIMESTAMP NOT NULL,
  "status" test_status_enum NOT NULL,
  "score" FLOAT NOT NULL,
  "type" test_type_enum NOT NULL
);

CREATE TABLE IF NOT EXISTS "voice_test" (
  "id" integer PRIMARY KEY REFERENCES "test" ("id"),
  "record_duration" FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS "spiral_test" (
  "id" integer PRIMARY KEY REFERENCES "test" ("id"),
  "draw_duration" FLOAT NOT NULL,
  "method" spiral_methods_enum NOT NULL
);

CREATE TABLE IF NOT EXISTS "note" (
  "id" SERIAL PRIMARY KEY,
  "content" TEXT NOT NULL,
  "patient_view" BOOLEAN NOT NULL,
  "category" note_category_enum NOT NULL DEFAULT 'OBSERVATION',
  "test_id" INTEGER NOT NULL REFERENCES "test" ("id"),
  "doctor_id" INTEGER NOT NULL REFERENCES "doctor" ("id"),
  "parent_note_id" INTEGER DEFAULT NULL REFERENCES "note" ("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "notification" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
  "message" VARCHAR(255) NOT NULL,
  "type" notification_type_enum NOT NULL,
  "bind_id" INTEGER DEFAULT NULL,
  "read" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW(); 
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_table_updated_at on "user";

CREATE TRIGGER update_table_updated_at
BEFORE UPDATE ON "user"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_note_updated_at ON "note";

CREATE TRIGGER update_note_updated_at
BEFORE UPDATE ON "note"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
