CREATE TABLE IF NOT EXISTS "user_type" (
  "id" integer PRIMARY KEY,
  "description" varchar UNIQUE NOT NULL
);

INSERT INTO "user_type" (id, description) VALUES (1, 'PATIENT') ON CONFLICT (id) DO NOTHING;
INSERT INTO "user_type" (id, description) VALUES (2, 'DOCTOR') ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS "user" (
  "id" SERIAL PRIMARY KEY,
  "type" integer NOT NULL,
  "name" varchar(50) NOT NULL,
  "email" varchar(255) UNIQUE NOT NULL,
  "hashed_password" varchar(255) NOT NULL,
  "cpf" char(11) UNIQUE NOT NULL,
  "birthdate" TIMESTAMP NOT NULL,
  "adress_id" integer NOT NULL,
  "is_active" boolean NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "patient" (
  "id" integer PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS "doctor" (
  "id" integer PRIMARY KEY,
  "crm" char(8) UNIQUE NOT NULL,
  "expertise_area" varchar(50),
  "status_approval" boolean
);

CREATE TABLE IF NOT EXISTS "adress" (
  "id" SERIAL PRIMARY KEY,
  "cep" char(8),
  "street" varchar(100),
  "number" varchar(10),
  "complement" varchar(50),
  "neighborhood" varchar(50),
  "city" varchar(100),
  "state" varchar(20)
);

ALTER TABLE "user" ADD FOREIGN KEY ("type") REFERENCES "user_type" ("id");

ALTER TABLE "patient" ADD FOREIGN KEY ("id") REFERENCES "user" ("id");
ALTER TABLE "doctor" ADD FOREIGN KEY ("id") REFERENCES "user" ("id");

ALTER TABLE "user" ADD FOREIGN KEY ("adress_id") REFERENCES "adress" ("id");



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