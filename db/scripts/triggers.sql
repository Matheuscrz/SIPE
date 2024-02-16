-- Função que reinicia o número de tentativas de login
CREATE OR REPLACE FUNCTION point.reset_login_attempts() RETURNS TRIGGER AS $$
BEGIN
    -- Verifica se o número de tentativas de login é maior que 0
    IF NEW.login_attempts > 0 THEN
        -- Se sim, espera 5 minutos para reiniciar as tentativas
        PERFORM pg_sleep(300);

        -- Reinicia o número de tentativas de login
        NEW.login_attempts := 0;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_failed_login
    AFTER UPDATE OF login_attempts ON point.employees
    FOR EACH ROW
    WHEN (NEW.login_attempts > 0)
    EXECUTE FUNCTION point.reset_login_attempts();