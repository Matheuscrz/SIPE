-- Instale as extensões necessárias
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criação do Schema 'point'
CREATE SCHEMA IF NOT EXISTS point;

-- Criação da tabela 'departments'
CREATE TABLE IF NOT EXISTS point.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_departments_name ON point.departments (name);

-- Criação da tabela 'roles'
CREATE TABLE IF NOT EXISTS point.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  department_id UUID REFERENCES point.departments(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_roles_name ON point.roles (name);

-- Criação da tabela 'work_schedules'
CREATE TABLE IF NOT EXISTS point.work_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  lunch_start_time TIME,
  lunch_end_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_work_schedules_name ON point.work_schedules (name);
CREATE INDEX IF NOT EXISTS idx_work_schedules_start_time ON point.work_schedules (start_time);
CREATE INDEX IF NOT EXISTS idx_work_schedules_end_time ON point.work_schedules (end_time);

-- Criar um tipo gender
CREATE TYPE point.gender AS ENUM ('Masculino', 'Feminino', 'Outro');

-- Criar um tipo regime
CREATE TYPE point.regime AS ENUM ('CLT', 'PJ', 'Estágio', 'Outro');

-- Criar um tipo permission
CREATE TYPE point.permission AS ENUM ('Normal', 'RH', 'Admin');

-- Criação da tabela 'employees'
CREATE TABLE IF NOT EXISTS point.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  pis VARCHAR(11) UNIQUE NOT NULL,
  pin VARCHAR(4) NOT NULL,
  gender point.gender NOT NULL,
  birth_date DATE NOT NULL,
  department_id UUID REFERENCES point.departments(id),
  roles_id UUID REFERENCES point.roles(id),
  work_schedule_id UUID REFERENCES point.work_schedules(id),
  hiring_date DATE NOT NULL,
  regime point.regime NOT NULL,
  permission point.permission DEFAULT 'Normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  login_attempts INT DEFAULT 0,
  max_login_attempts INT DEFAULT 5
);
CREATE INDEX IF NOT EXISTS idx_name ON point.employees (name);
CREATE INDEX IF NOT EXISTS idx_cpf ON point.employees (cpf);
CREATE INDEX IF NOT EXISTS idx_password ON point.employees (password);
CREATE INDEX IF NOT EXISTS idx_active ON point.employees (active);

CREATE TABLE IF NOT EXISTS point.login_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES point.employees(id) UNIQUE NOT NULL,
  refresh_token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_user_id ON point.login_tokens (user_id);
CREATE INDEX idx_refresh_token ON point.login_tokens (refresh_token);

-- Criação da tabela 'permissions'
CREATE TABLE IF NOT EXISTS point.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  can_manage_users BOOLEAN DEFAULT FALSE,
  can_manage_departments BOOLEAN DEFAULT FALSE,
  can_manage_work_schedules BOOLEAN DEFAULT FALSE,
  can_approve_absences BOOLEAN DEFAULT FALSE,
  can_generate_reports BOOLEAN DEFAULT FALSE,
  can_view_all_time_records BOOLEAN DEFAULT FALSE,
  can_manage_device_configuration BOOLEAN DEFAULT FALSE,
  can_manage_company_info BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_permissions_name ON point.permissions (name);

-- Inserir permissões padrão
INSERT INTO point.permissions (name, can_view_all_time_records) VALUES ('Normal', TRUE);
INSERT INTO point.permissions (name, can_manage_users, can_manage_departments, can_manage_work_schedules, can_approve_absences, can_generate_reports, can_view_all_time_records) VALUES ('RH', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);
INSERT INTO point.permissions (name, can_manage_users, can_manage_departments, can_manage_work_schedules, can_approve_absences, can_generate_reports, can_view_all_time_records, can_manage_device_configuration, can_manage_company_info) VALUES ('Admin', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);

-- Criação da tabela 'time_records'
CREATE TABLE IF NOT EXISTS point.time_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES point.employees(id),
  record_time TIMESTAMP NOT NULL,
  record_date DATE NOT NULL, 
  location POINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_time_records_employee_id ON point.time_records (employee_id);
CREATE INDEX IF NOT EXISTS idx_time_records_record_time ON point.time_records (record_time);
CREATE INDEX IF NOT EXISTS idx_time_records_record_date ON point.time_records (record_date);

-- Criação da tabela 'absence_justifications'
CREATE TABLE IF NOT EXISTS point.absence_justifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES point.employees(id),
  justification TEXT NOT NULL,
  justification_date DATE NOT NULL,
  status point.permission DEFAULT 'Normal', -- ou 'RH' ou 'Admin', conforme apropriado
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_absence_justifications_employee_id ON point.absence_justifications (employee_id);

-- Alteração da tabela 'time_records' para adicionar coluna 'absence_justification_id'
ALTER TABLE point.time_records
ADD COLUMN absence_justification_id UUID REFERENCES point.absence_justifications(id);

-- Tabela de Dispositivos (Relógios de Ponto)
-- Armazena informações sobre os relógios de ponto físicos utilizados para registros.
CREATE TABLE IF NOT EXISTS point.devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address VARCHAR(15) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Informações da Empresa
-- Armazena informações sobre a empresa, como razão social, CNPJ, endereço, certificado digital e logotipo.
CREATE TABLE IF NOT EXISTS point.company_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(14) UNIQUE NOT NULL,
  address VARCHAR(255) NOT NULL,
  certificate_digital TEXT NOT NULL,
  logo BYTEA,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela 'revoked_tokens'
CREATE TABLE IF NOT EXISTS point.revoked_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_revoked_tokens_token ON point.revoked_tokens (token);
