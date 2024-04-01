CREATE OR REPLACE FUNCTION remove_expired_tokens()
RETURNS void AS
$$
BEGIN
    -- Remove os tokens expirados
    DELETE FROM point.login_tokens WHERE expires_at <= CURRENT_DATE;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION schedule_remove_expired_tokens()
RETURNS void AS
$$
BEGIN
    PERFORM pg_cron.schedule('0 0 * * *', 'SELECT remove_expired_tokens()');
END;
$$
LANGUAGE plpgsql;

SELECT schedule_remove_expired_tokens();

