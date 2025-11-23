CREATE TABLE IF NOT EXISTS "doctor_activity_log" (
  "id" SERIAL PRIMARY KEY,
  "doctor_id" INTEGER NOT NULL REFERENCES "doctor" ("id"),
  "activity_type" activity_type_enum NOT NULL,
  "description" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_doctor_activity_doctor_id ON doctor_activity_log(doctor_id);