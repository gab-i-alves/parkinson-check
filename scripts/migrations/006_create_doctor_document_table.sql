CREATE TABLE IF NOT EXISTS "doctor_document" (
  "id" SERIAL PRIMARY KEY,
  "doctor_id" INTEGER NOT NULL REFERENCES "doctor" ("id"),
  "document_type" document_type_enum NOT NULL,
  "file_name" VARCHAR(255) NOT NULL,
  "file_path" VARCHAR(500) NOT NULL,
  "file_size" INTEGER NOT NULL,  -- em bytes
  "mime_type" VARCHAR(100) NOT NULL,
  "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "verified" BOOLEAN NOT NULL DEFAULT FALSE,
  "verified_by_admin_id" INTEGER REFERENCES "admin" ("id"),
  "verified_at" TIMESTAMPTZ
);