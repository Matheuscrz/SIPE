-- Instale as extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criação do Schema 'point'
CREATE SCHEMA IF NOT EXISTS point;

-- Criação do tipo ENUM para 'gender'
CREATE TYPE point.gender AS ENUM ('Masculino', 'Feminino', 'Outros');

-- Criação do tipo ENUM para 'regime'
CREATE TYPE point.regime AS ENUM ('CLT', 'PJ');

-- Criação do tipo ENUM para 'permission'
CREATE TYPE point.permission AS ENUM ('Normal', 'RH', 'Admin');

-- Função para gerar log de alteração
CREATE OR REPLACE FUNCTION point.log_alteracao(
  p_affected_table VARCHAR(255), 
  p_affected_column VARCHAR(255),
  p_affected_row JSONB,
  p_action point.permission
)
RETURNS VOID AS $$
BEGIN
  -- Lógica para registrar a alteração, por exemplo:
  INSERT INTO point.logs (affected_table, affected_column, affected_row, action, created_at)
  VALUES (p_affected_table, p_affected_column, p_affected_row, p_action, CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql;

-- Função para revogar um token
CREATE OR REPLACE FUNCTION point.revoke_token(p_token VARCHAR(500), p_expires_at TIMESTAMP)
RETURNS VOID AS $$
BEGIN
  INSERT INTO point.revoked_tokens (token, expires_at)
  VALUES (p_token, p_expires_at);
END;
$$ LANGUAGE plpgsql;
