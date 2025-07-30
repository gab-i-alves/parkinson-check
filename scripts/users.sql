CREATE TABLE IF NOT EXISTS "user_type" (
  "id" integer PRIMARY KEY,
  "description" varchar UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" integer PRIMARY KEY,
  "type" integer NOT NULL,
  "name" varchar(50) NOT NULL,
  "email" varchar(255) UNIQUE NOT NULL,
  "hashed_password" varchar(255) NOT NULL,
  "cpf" char(11) UNIQUE NOT NULL,
  "is_active" boolean NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "users" ADD FOREIGN KEY ("type") REFERENCES "user_type" ("id");

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW(); 
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_table_updated_at on "users";

CREATE TRIGGER update_table_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();