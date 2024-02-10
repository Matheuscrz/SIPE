-- Instale a extensão pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
-- Instale a extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- Criação do Schema 'point'
CREATE SCHEMA IF NOT EXISTS point;

-- Tabela de Departamentos
-- Esta tabela armazena informações sobre os departamentos na empresa.
CREATE TABLE IF NOT EXISTS point.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_departments_name ON point.departments (name);

-- Tabela de Cargos
-- Esta tabela mantém informações sobre os cargos dos funcionários na empresa.
CREATE TABLE IF NOT EXISTS point.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  department_id UUID REFERENCES point.departments(id),
  salary DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_roles_name ON point.roles (name);

-- Tabela de Jornadas de Trabalho
-- Armazena informações sobre os horários de trabalho, incluindo o horário do almoço.
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

-- Tabela de Funcionários
-- Armazena informações detalhadas sobre os funcionários da empresa.
CREATE TABLE IF NOT EXISTS point.employees(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  pis VARCHAR(11) UNIQUE NOT NULL,
  pin VARCHAR(4) NOT NULL,
  gender ENUM('Masculino', 'Feminino', 'Outros') NOT NULL,
  birth_date DATE NOT NULL,
  department_id UUID REFERENCES point.departments(id),
  roles_id UUID REFERENCES point.roles(id),
  work_schedule_id UUID REFERENCES point.work_schedules(id),
  hiring_date DATE NOT NULL,
  regime ENUM('CLT', 'PJ') NOT NULL,
  permission ENUM('Normal', 'RH', 'Admin') DEFAULT 'Normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  login_attempts INT DEFAULT 0,
  max_login_attempts INT DEFAULT 5
);

CREATE INDEX IF NOT EXISTS idx_name ON point.employees (name);
CREATE INDEX IF NOT EXISTS idx_cpf ON point.employees (cpf);
CREATE INDEX IF NOT EXISTS idx_password ON point.employees (password);

-- Tabela de Permissões
-- Armazena as permissões atribuídas aos usuários, controlando o acesso a recursos específicos.
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

-- Tabela de Registros de Ponto
-- Registra os horários de entrada e saída dos funcionários.
CREATE TABLE IF NOT EXISTS point.time_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES point.employees(id),
  record_time TIMESTAMP NOT NULL,
  record_date DATE NOT NULL, 
  location POINT,
  record_type ENUM('Entrada', 'Saída') GENERATED ALWAYS AS (
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM point.work_schedules
        WHERE employee_id = point.time_records.employee_id
          AND record_date = point.time_records.record_date
          AND record_time BETWEEN start_time AND end_time
      ) THEN 'Entrada'
      ELSE 'Saída'
    END
  ) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_time_records_employee_id ON point.time_records (employee_id);
CREATE INDEX IF NOT EXISTS idx_time_records_record_time ON point.time_records (record_time);
CREATE INDEX IF NOT EXISTS idx_time_records_record_date ON point.time_records (record_date);

-- Tabela de Justificativas de Falta
-- Registra as justificativas de falta submetidas pelos funcionários.
CREATE TABLE IF NOT EXISTS point.absence_justifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES point.employees(id),
  justification TEXT NOT NULL,
  justification_date DATE NOT NULL,
  status ENUM('Aprovado', 'Rejeitado', 'Pendente') DEFAULT 'Pendente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_absence_justifications_employee_id ON point.absence_justifications (employee_id);

ALTER TABLE point.time_records
ADD COLUMN absence_justification_id UUID REFERENCES point.absence_justifications(id);

-- Tabela de Logs
-- Registra alterações em outras tabelas.
CREATE TABLE IF NOT EXISTS point.logs(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affected_table VARCHAR(255) NOT NULL,
  affected_column VARCHAR(255),
  affected_row JSONB,
  action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar trigger para gerar log em cada tabela
CREATE TRIGGER log_departments
AFTER INSERT OR UPDATE OR DELETE ON point.departments
FOR EACH ROW
EXECUTE FUNCTION log_alteracao('name');

CREATE TRIGGER log_roles
AFTER INSERT OR UPDATE OR DELETE ON point.roles
FOR EACH ROW
EXECUTE FUNCTION log_alteracao('name', 'department_id', 'salary');

CREATE TRIGGER log_work_schedules
AFTER INSERT OR UPDATE OR DELETE ON point.work_schedules
FOR EACH ROW
EXECUTE FUNCTION log_alteracao('name', 'start_time', 'end_time', 'lunch_start_time', 'lunch_end_time');

CREATE TRIGGER log_employees
AFTER INSERT OR UPDATE OR DELETE ON point.employees
FOR EACH ROW
EXECUTE FUNCTION log_alteracao('name', 'password', 'cpf', 'pis', 'pin', 'gender', 'birth_date', 'department_id', 'roles_id', 'work_schedule_id', 'hiring_date', 'regime', 'permission', 'login_attempts', 'max_login_attempts');

CREATE TRIGGER log_permissions
AFTER INSERT OR UPDATE OR DELETE ON point.permissions
FOR EACH ROW
EXECUTE FUNCTION log_alteracao('name');

CREATE TRIGGER log_employees_permissions
AFTER INSERT OR UPDATE OR DELETE ON point.employees_permissions
FOR EACH ROW
EXECUTE FUNCTION log_alteracao('permission', 'employee_id');

CREATE TRIGGER log_absence_justifications
AFTER INSERT OR UPDATE OR DELETE ON point.absence_justifications
FOR EACH ROW
EXECUTE FUNCTION log_alteracao('employee_id', 'justification', 'justification_date', 'status', 'absence_justification_id');

CREATE TRIGGER log_time_records
AFTER INSERT OR UPDATE OR DELETE ON point.time_records
FOR EACH ROW
EXECUTE FUNCTION log_alteracao('employee_id', 'record_time', 'record_type', 'absence_justification_id', 'record_date', 'location');

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

-- Inserir usuário admin
-- Inserir departamento exclusivo para o usuário admin
INSERT INTO point.departments (id, name, created_at) VALUES (uuid_generate_v4(), 'Admin Department', CURRENT_TIMESTAMP);

-- Inserir cargo exclusivo para o usuário admin
INSERT INTO point.roles (id, name, department_id, salary, created_at) VALUES (uuid_generate_v4(), 'Admin Role', 'admin-department-id', 0.00, CURRENT_TIMESTAMP);

-- Obter o UUID do departamento exclusivo para o usuário admin
DECLARE admin_department_id UUID;
SELECT id INTO admin_department_id FROM point.departments WHERE name = 'Admin Department';

-- Obter o UUID do cargo exclusivo para o usuário admin
DECLARE admin_roles_id UUID;
SELECT id INTO admin_roles_id FROM point.roles WHERE name = 'Admin Role';

-- Inserir jornada de trabalho exclusiva para o usuário admin
INSERT INTO point.work_schedules (id, name, start_time, end_time, lunch_start_time, lunch_end_time, created_at) 
VALUES (uuid_generate_v4(), 'Admin Work Schedule', '08:00:00', '17:00:00', '12:00:00', '13:00:00', CURRENT_TIMESTAMP);

-- Obter o UUID da jornada de trabalho exclusiva para o usuário admin
DECLARE admin_work_schedule_id UUID;
SELECT id INTO admin_work_schedule_id FROM point.work_schedules WHERE name = 'Admin Work Schedule';

-- Inserir usuário admin com senha criptografada usando crypt
INSERT INTO point.employees (
  id,
  name,
  password,
  cpf,
  pis,
  pin,
  gender,
  birth_date,
  department_id,
  roles_id,
  work_schedule_id,
  hiring_date,
  regime,
  permission,
  created_at
) VALUES (
  uuid_generate_v4(),  -- UUID do usuário admin
  'admin',     -- Nome do usuário admin
  crypt('adminsipe@@159753', gen_salt('bf')), -- Senha criptografada usando bcrypt
  'admin-cpf', -- CPF do usuário admin
  '00000000000', -- PIS do usuário admin (substitua pelos 11 dígitos reais, se necessário)
  '0000',       -- PIN do usuário admin (substitua pelos 4 dígitos reais, se necessário)
  'Outros',    -- Gênero do usuário admin (ou 'Masculino', 'Feminino', etc.)
  '2024-01-01', -- Data de nascimento do usuário admin
  admin_department_id, -- UUID do departamento exclusivo para o usuário admin
  admin_roles_id,      -- UUID do cargo exclusivo para o usuário admin
  admin_work_schedule_id, -- UUID da jornada de trabalho exclusiva para o usuário admin
  '2024-02-10', -- Data de contratação do usuário admin
  'Admin',      -- Permissão do usuário admin (ou 'Normal', 'RH', 'Admin')
  CURRENT_TIMESTAMP -- Data de criação do usuário admin
);


