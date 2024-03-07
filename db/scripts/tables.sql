    -- Instale as extensões necessárias
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
CREATE TYPE point.gender AS ENUM ('Masculino', 'Feminino', 'Outros');

-- Criar um tipo regime
CREATE TYPE point.regime AS ENUM ('CLT', 'PJ', 'Estágio', 'Outro');

-- Criar um tipo permission
CREATE TYPE point.permission AS ENUM ('Normal', 'RH', 'Admin');

-- Criação da tabela 'permissions'
CREATE TABLE IF NOT EXISTS point.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name point.permission UNIQUE NOT NULL,
  can_manage_users BOOLEAN DEFAULT FALSE,
  can_manage_departments BOOLEAN DEFAULT FALSE,
  can_manage_work_schedules BOOLEAN DEFAULT FALSE,
  can_manage_roles BOOLEAN DEFAULT FALSE,
  can_manage_permissions BOOLEAN DEFAULT FALSE,
  can_approve_absences BOOLEAN DEFAULT FALSE,
  can_generate_reports BOOLEAN DEFAULT FALSE,
  can_view_all_time_records BOOLEAN DEFAULT FALSE,
  can_manage_device_configuration BOOLEAN DEFAULT FALSE,
  can_manage_company_info BOOLEAN DEFAULT FALSE,
  created_at DATE DEFAULT NOW()
);
-- Criação de índice
CREATE INDEX IF NOT EXISTS idx_permissions_name ON point.permissions (name);
-- Inserir permissões padrão
INSERT INTO point.permissions (name, can_view_all_time_records) VALUES ('Normal', TRUE);
-- Inserir permissões padrão
INSERT INTO point.permissions (name, can_manage_users, can_manage_departments, can_manage_work_schedules, can_manage_roles, can_approve_absences, can_generate_reports, can_view_all_time_records) VALUES ('RH', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);
-- Inserir permissões padrão
INSERT INTO point.permissions (name, can_manage_users, can_manage_departments, can_manage_work_schedules,can_manage_roles, can_manage_permissions, can_approve_absences, can_generate_reports, can_view_all_time_records, can_manage_device_configuration, can_manage_company_info) VALUES ('Admin', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);

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
  department UUID REFERENCES point.departments(id),
  roles UUID REFERENCES point.roles(id),
  work_schedule UUID REFERENCES point.work_schedules(id),
  hiring_date DATE NOT NULL,
  regime point.regime NOT NULL,
  permission UUID REFERENCES point.permissions(id) DEFAULT get_default_permission_id() NOT NULL,
  created_at DATE DEFAULT NOW() NOT NULL,
  active BOOLEAN DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_name ON point.employees (name);
CREATE INDEX IF NOT EXISTS idx_cpf ON point.employees (cpf);
CREATE INDEX IF NOT EXISTS idx_password ON point.employees (password);
CREATE INDEX IF NOT EXISTS idx_active ON point.employees (active);
CREATE INDEX IF NOT EXISTS idx_permission_id ON point.employees (permission);
CREATE INDEX IF NOT EXISTS idx_roles_id ON point.employees (roles);
CREATE INDEX IF NOT EXISTS idx_department_id ON point.employees (department);
CREATE INDEX IF NOT EXISTS idx_work_schedule_id ON point.employees (work_schedule);

CREATE TABLE IF NOT EXISTS point.login_tokens (
  id UUID PRIMARY KEY REFERENCES point.employees(id),
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at DATE NOT NULL,
  created_at DATE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_token ON point.login_tokens (token);

-- Criação da tabela 'time_records'
CREATE TABLE IF NOT EXISTS point.time_records (
  id UUID PRIMARY KEY REFERENCES point.employees(id) NOT NULL,
  record_time TIMESTAMP NOT NULL,
  record_date DATE NOT NULL, 
  location POINT,
  created_at DATE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_time_records_record_time ON point.time_records (record_time);
CREATE INDEX IF NOT EXISTS idx_time_records_record_date ON point.time_records (record_date);

-- Criação da tabela 'absence_justifications'
CREATE TABLE IF NOT EXISTS point.absence_justifications (
  id UUID PRIMARY KEY REFERENCES point.time_records(id) NOT NULL,
  justification TEXT NOT NULL,
  justification_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Inserir departamento exclusivo para o usuário admin
INSERT INTO point.departments (id, name, created_at) VALUES (uuid_generate_v4(), 'Admin Department', CURRENT_TIMESTAMP);

-- Inserir cargo exclusivo para o usuário admin
INSERT INTO point.roles (id, name, department_id, created_at) VALUES (uuid_generate_v4(), 'Admin Role', (SELECT id FROM point.departments WHERE name = 'Admin Department'), CURRENT_TIMESTAMP);

-- Inserir jornada de trabalho exclusiva para o usuário admin
INSERT INTO point.work_schedules (id, name, start_time, end_time, lunch_start_time, lunch_end_time, created_at) 
VALUES (uuid_generate_v4(), 'Admin Work Schedule', '08:00:00', '17:00:00', '12:00:00', '13:00:00', CURRENT_TIMESTAMP);