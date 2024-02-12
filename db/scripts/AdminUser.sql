-- Inserir usuário admin
-- Inserir departamento exclusivo para o usuário admin
INSERT INTO point.departments (id, name, created_at) VALUES (uuid_generate_v4(), 'Admin Department', CURRENT_TIMESTAMP);

-- Inserir cargo exclusivo para o usuário admin
INSERT INTO point.roles (id, name, department_id, created_at) VALUES (uuid_generate_v4(), 'Admin Role', (SELECT id FROM point.departments WHERE name = 'Admin Department'), CURRENT_TIMESTAMP);

-- Inserir jornada de trabalho exclusiva para o usuário admin
INSERT INTO point.work_schedules (id, name, start_time, end_time, lunch_start_time, lunch_end_time, created_at) 
VALUES (uuid_generate_v4(), 'Admin Work Schedule', '08:00:00', '17:00:00', '12:00:00', '13:00:00', CURRENT_TIMESTAMP);

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
  permission
) VALUES (
  uuid_generate_v4(),  -- UUID do usuário admin
  'admin',     -- Nome do usuário admin
  crypt('admin', gen_salt('bf')), -- Senha criptografada usando bcrypt
  '00000000000', 
  '00000000000', 
  '0000',       
  'Outros',    
  '2024-01-01', 
  (SELECT id FROM point.departments WHERE name = 'Admin Department'), 
  (SELECT id FROM point.roles WHERE name = 'Admin Role'),     
  (SELECT id FROM point.work_schedules WHERE name = 'Admin Work Schedule'), 
  '2024-02-10', 
  'CLT',
  'Admin'   
);

