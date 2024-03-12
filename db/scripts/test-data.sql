-- Inserir dados de teste para a tabela 'departments'
INSERT INTO point.departments (id, name, created_at) VALUES
  (uuid_generate_v4(), 'Department 1', CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Department 2', CURRENT_TIMESTAMP);

-- Inserir dados de teste para a tabela 'roles'
INSERT INTO point.roles (id, name, department_id, created_at) VALUES
  (uuid_generate_v4(), 'Role 1', (SELECT id FROM point.departments WHERE name = 'Department 1'), CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Role 2', (SELECT id FROM point.departments WHERE name = 'Department 2'), CURRENT_TIMESTAMP);

-- Inserir dados de teste para a tabela 'work_schedules'
INSERT INTO point.work_schedules(name, start_time, end_time, lunch_start_time, lunch_end_time) VALUES (
  'Work Schedule 1', '08:00:00', '18:00:00', '12:00:00', '13:00:00'
);


-- Inserir dados de teste para a tabela 'employees'
INSERT INTO point.employees (name, password, cpf, pis, pin, gender, birth_date, department, roles, work_schedule, hiring_date, regime) VALUES (
  'Test', '123456', '12345678900', '12345678900', '1234', 'Outros', '1990-01-01', (SELECT id FROM point.departments WHERE name = 'Department 1'), (SELECT id FROM point.roles WHERE name = 'Role 1'), (SELECT id FROM point.work_schedules WHERE name = 'Work Schedule 1'), '2020-01-01', 'CLT'
)