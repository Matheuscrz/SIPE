-- Se necessário, instale a extensão pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Tabela de Departamentos
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_departments_name ON departments (name);

-- Tabela de Cargos
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  department_id UUID REFERENCES departments(id),
  salary DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_roles_name ON roles (name);

-- Tabela de Jornadas de Trabalho
CREATE TABLE IF NOT EXISTS work_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  lunch_start_time TIME,
  lunch_end_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_work_schedules_name ON work_schedules (name);
CREATE INDEX IF NOT EXISTS idx_work_schedules_start_time ON work_schedules (start_time);
CREATE INDEX IF NOT EXISTS idx_work_schedules_end_time ON work_schedules (end_time);

-- Tabela de Funcionários
CREATE TABLE IF NOT EXISTS employees(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  pis VARCHAR(11) UNIQUE NOT NULL,
  pin VARCHAR(4) NOT NULL,
  gender ENUM('Masculino', 'Feminino', 'Outros') NOT NULL,
  birth_date DATE NOT NULL,
  department_id UUID REFERENCES departments(id),
  roles_id UUID REFERENCES roles(id),
  work_schedule_id UUID REFERENCES work_schedules(id),
  hiring_date DATE NOT NULL,
  regime ENUM('CLT', 'PJ') NOT NULL,
  permission ENUM('Normal', 'RH', 'Admin') DEFAULT 'Normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  login_attempts INT DEFAULT 0,
  max_login_attempts INT DEFAULT 5
);

CREATE INDEX idx_name ON employees (name);
CREATE INDEX idx_cpf ON employees (cpf);
CREATE INDEX idx_password ON employees (password);

-- Tabela de Permissões
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions (name);

-- Tabela de Funcionários e Permissões
CREATE TABLE IF NOT EXISTS employees_permissions(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permission ENUM('Normal', 'RH', 'Admin') REFERENCES employees(permission),
  employee_id UUID REFERENCES employees(id)
);

-- Tabela de Logs
CREATE TABLE IF NOT EXISTS logs(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affected_table VARCHAR(255) NOT NULL,
  affected_column VARCHAR(255),
  affected_row JSONB,
  action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar a função para resetar login_attempts
CREATE OR REPLACE FUNCTION reset_login_attempts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.login_attempts := 0;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger que chama a função antes de uma atualização na tabela
CREATE TRIGGER reset_login_attempts_trigger
BEFORE UPDATE ON employees
FOR EACH ROW
WHEN (NEW.login_attempts >= NEW.max_login_attempts)
EXECUTE FUNCTION reset_login_attempts();

-- Criar o job no pg_cron para resetar login_attempts a cada hora
SELECT cron.schedule('0 * * * *', $$ -- Executar a cada hora
  UPDATE employees
  SET login_attempts = 0
  WHERE login_attempts >= max_login_attempts
$$);

-- Função para gerar log
CREATE OR REPLACE FUNCTION log_alteracao()
RETURNS TRIGGER AS $$
DECLARE
  changed_row JSONB;
BEGIN
  IF TG_OP = 'DELETE' THEN
    changed_row = row_to_json(OLD);
  ELSE
    changed_row = row_to_json(NEW);
  END IF;

  INSERT INTO logs (affected_table, affected_column, affected_row, action)
  VALUES (TG_TABLE_NAME, TG_ARGV[0], changed_row, TG_OP);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para gerar log em cada tabela
CREATE TRIGGER log_departments
AFTER INSERT OR UPDATE OR DELETE ON departments
FOR EACH ROW
EXECUTE FUNCTION log_alteracao('name');

CREATE TRIGGER log_roles
AFTER INSERT OR UPDATE OR DELETE ON roles
FOR EACH ROW
EXECUTE FUNCTION log_alteracao('name', 'department_id', 'salary');

CREATE TRIGGER log_work_schedules
AFTER INSERT OR UPDATE OR DELETE ON work_schedules
FOR EACH ROW
EXECUTE FUNCTION log_alteracao('name', 'start_time', 'end_time', 'lunch_start_time', 'lunch_end_time');

CREATE TRIGGER log_employees
AFTER INSERT OR UPDATE OR DELETE ON employees
FOR EACH ROW
EXECUTE FUNCTION log_alteracao('name', 'password', 'cpf', 'pis', 'pin', 'gender', 'birth_date', 'department_id', 'roles_id', 'work_schedule_id', 'hiring_date', 'regime', 'permission', 'login_attempts', 'max_login_attempts');

CREATE TRIGGER log_permissions
AFTER INSERT OR UPDATE OR DELETE ON permissions
FOR EACH ROW
EXECUTE FUNCTION log_alteracao('name');

CREATE TRIGGER log_employees_permissions
AFTER INSERT OR UPDATE OR DELETE ON employees_permissions
FOR EACH ROW
EXECUTE FUNCTION log_alteracao('permission', 'employee_id');