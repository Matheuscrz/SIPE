-- Define o esquema padrão para point
SET search_path TO point;

--Trigger para consultar o id da permissão padrão
CREATE OR REPLACE FUNCTION get_default_permission_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM point.permissions WHERE name = 'Normal');
END;
$$ LANGUAGE plpgsql;

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
