-- Adicionar trigger para gerar log em cada tabela
CREATE TRIGGER log_departments
AFTER INSERT OR UPDATE OR DELETE ON point.departments
FOR EACH ROW
EXECUTE FUNCTION point.log_alteracao('name');

CREATE TRIGGER log_roles
AFTER INSERT OR UPDATE OR DELETE ON point.roles
FOR EACH ROW
EXECUTE FUNCTION point.log_alteracao('name', 'department_id');

CREATE TRIGGER log_work_schedules
AFTER INSERT OR UPDATE OR DELETE ON point.work_schedules
FOR EACH ROW
EXECUTE FUNCTION point.log_alteracao('name', 'start_time', 'end_time', 'lunch_start_time', 'lunch_end_time');

CREATE TRIGGER log_employees
AFTER INSERT OR UPDATE OR DELETE ON point.employees
FOR EACH ROW
EXECUTE FUNCTION point.log_alteracao('name', 'password', 'cpf', 'pis', 'pin', 'gender', 'birth_date', 'department_id', 'roles_id', 'work_schedule_id', 'hiring_date', 'regime', 'permission', 'login_attempts', 'max_login_attempts');

CREATE TRIGGER log_permissions
AFTER INSERT OR UPDATE OR DELETE ON point.permissions
FOR EACH ROW
EXECUTE FUNCTION point.log_alteracao('name', 'can_manage_users', 'can_manage_departments', 'can_manage_work_schedules', 'can_approve_absences', 'can_generate_reports', 'can_view_all_time_records', 'can_manage_device_configuration', 'can_manage_company_info');

CREATE TRIGGER log_employees_permissions
AFTER INSERT OR UPDATE OR DELETE ON point.employees_permissions
FOR EACH ROW
EXECUTE FUNCTION point.log_alteracao('permission', 'employee_id');

CREATE TRIGGER log_absence_justifications
AFTER INSERT OR UPDATE OR DELETE ON point.absence_justifications
FOR EACH ROW
EXECUTE FUNCTION point.log_alteracao('employee_id', 'justification', 'justification_date', 'status', 'absence_justification_id');

CREATE TRIGGER log_time_records
AFTER INSERT OR UPDATE OR DELETE ON point.time_records
FOR EACH ROW
EXECUTE FUNCTION point.log_alteracao('employee_id', 'record_time', 'record_type', 'absence_justification_id', 'record_date', 'location');
