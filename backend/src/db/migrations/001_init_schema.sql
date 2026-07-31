-- =========================================
-- 001_init_schema.sql
-- MCMC Complaint Management System (Mini)
-- =========================================

-- ---------- ENUM TYPES ----------
-- Native Postgres enums enforce validity at the database level,
-- not just in application code.

CREATE TYPE user_role AS ENUM ('officer', 'admin');

CREATE TYPE complaint_category AS ENUM (
  'Network Service Quality',
  'Fraud, Scam & Security',
  'Billing & Charges',
  'Service Provisioning',
  'Digital & Online Services'
);

CREATE TYPE complaint_status AS ENUM (
  'New',
  'Investigation',
  'On Hold',
  'Appeal',
  'Resolved',
  'Closed'
);

CREATE TYPE activity_action AS ENUM (
  'created',
  'status_changed',
  'assigned',
  'commented'
);

-- ---------- USERS (Officer) ----------

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          user_role     NOT NULL DEFAULT 'officer',
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ---------- COMPLAINTS ----------

CREATE TABLE complaints (
  id                SERIAL PRIMARY KEY,
  title             VARCHAR(200)        NOT NULL,
  description       TEXT                NOT NULL,
  category          complaint_category  NOT NULL,
  status            complaint_status    NOT NULL DEFAULT 'New',
  complainant_name  VARCHAR(150)        NOT NULL,
  complainant_phone VARCHAR(30),
  complainant_email VARCHAR(150),
  assigned_to       INTEGER REFERENCES users(id) ON DELETE SET NULL,  -- nullable FK
  created_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- ---------- ACTIVITY LOGS ----------

CREATE TABLE activity_logs (
  id            SERIAL PRIMARY KEY,
  complaint_id  INTEGER          NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  action        activity_action  NOT NULL,
  description   TEXT             NOT NULL,
  performed_by  INTEGER          NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- ---------- INDEXES ----------
-- Match these to what the API actually filters/sorts on (see README section 6)

CREATE INDEX idx_complaints_status     ON complaints(status);
CREATE INDEX idx_complaints_category   ON complaints(category);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_activity_logs_complaint_id ON activity_logs(complaint_id);

-- ---------- AUTO-UPDATE updated_at ----------
-- Keeps updated_at accurate without relying on application code to set it

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
