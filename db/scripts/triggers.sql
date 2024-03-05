-- Define o esquema padrão para point
SET search_path TO point;

-- Trigger para remover tokens expirados
CREATE OR REPLACE FUNCTION remove_expired_tokens() RETURNS TRIGGER AS $$
DECLARE
    expired_tokens CURSOR FOR
        SELECT token FROM point.login_tokens WHERE expires_at < NOW();
    expired_token_record RECORD;
BEGIN
    FOR expired_token_record IN expired_tokens
    LOOP
        DELETE FROM point.login_tokens WHERE token = expired_token_record.token;
    END LOOP;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER remove_expired_tokens_trigger
AFTER INSERT OR UPDATE OR DELETE ON point.login_tokens
FOR EACH ROW EXECUTE FUNCTION remove_expired_tokens();

-- Função para criar um novo funcionário
CREATE OR REPLACE FUNCTION create_employee(
    p_name VARCHAR(255),
    p_password VARCHAR(255),
    p_cpf VARCHAR(11),
    p_pis VARCHAR(11),
    p_pin VARCHAR(4),
    p_gender point.gender,
    p_birth_date DATE,
    p_department_id UUID,
    p_roles_id UUID,
    p_work_schedule_id UUID,
    p_hiring_date DATE,
    p_regime point.regime,
    p_permission_id UUID DEFAULT NULL,
    p_created_at DATE DEFAULT NOW(),
    p_active BOOLEAN DEFAULT TRUE
) RETURNS UUID AS $$
DECLARE
    new_employee_id UUID;
BEGIN
    INSERT INTO point.employees(
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
        permission_id
    ) VALUES (
        p_name,
        p_password,
        p_cpf,
        p_pis,
        p_pin,
        p_gender,
        p_birth_date,
        p_department_id,
        p_roles_id,
        p_work_schedule_id,
        p_hiring_date,
        p_regime,
        COALESCE(p_permission_id, (SELECT id FROM point.permissions WHERE name = 'Normal'))
    ) RETURNING id INTO new_employee_id;
    
    RETURN new_employee_id;
END;
$$ LANGUAGE plpgsql;
