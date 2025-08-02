CREATE TABLE IF NOT EXISTS "user_type" (
  "id" integer PRIMARY KEY,
  "description" varchar UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "user" (
  "id" integer PRIMARY KEY,
  "type" integer NOT NULL,
  "name" varchar(50) NOT NULL,
  "email" varchar(255) UNIQUE NOT NULL,
  "hashed_password" varchar(255) NOT NULL,
  "cpf" char(11) UNIQUE NOT NULL,
  "birthdate" TIMESTAMP NOT NULL,
  -- "adress" integer NOT NULL,
  "cep" char(8) NOT NULL,
  "street" varchar(100) NOT NULL,
  "number" integer NOT NULL,
  "complement" varchar(50),
  "neighborhood" varchar(50) NOT NULL,
  "city" varchar(100) NOT NULL,
  "state" varchar(20) NOT NULL,
  "is_active" boolean NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "doctor" (
  "id" integer PRIMARY KEY,
  "crm" char(8) UNIQUE NOT NULL,
  "expertise_area" varchar(50),
  "status_approval" boolean
);

-- CREATE TABLE IF NOT EXISTS "adress" (
--   "id" integer PRIMARY KEY,
--   "cep" char(8),
--   "street" varchar(100),
--   "number" varchar(6),
--   "complement" varchar(50),
--   "neighborhood" varchar(50),
--   "city" varchar(100),
--   "state" varchar(20)
-- );

ALTER TABLE "user" ADD FOREIGN KEY ("type") REFERENCES "user_type" ("id");

ALTER TABLE "doctor" ADD FOREIGN KEY ("id") REFERENCES "user" ("id");

-- ALTER TABLE "user" ADD FOREIGN KEY ("adress") REFERENCES "adress" ("id");



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