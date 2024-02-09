-- Se necessário, instale a extensão pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Criar a tabela users com UUID e triggers
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  login_attempts INT DEFAULT 0,
  max_login_attempts INT DEFAULT 5
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
BEFORE UPDATE ON users
FOR EACH ROW
WHEN (NEW.login_attempts >= NEW.max_login_attempts)
EXECUTE FUNCTION reset_login_attempts();

-- Criar o job no pg_cron para resetar login_attempts a cada hora
SELECT cron.schedule('0 * * * *', $$ -- Executar a cada hora
  UPDATE users
  SET login_attempts = 0
  WHERE login_attempts >= max_login_attempts
$$);
