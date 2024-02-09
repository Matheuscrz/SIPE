CREATE DATABASE Sipe;

CREATE SCHEMA ponto;

CREATE TABLE ponto.Empresa (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cnpj VARCHAR(14) UNIQUE NOT NULL,
  razao_social VARCHAR(255) NOT NULL,
  logo BYTEA
);

CREATE TABLE ponto.Regime (
  id SERIAL PRIMARY KEY,
  nome varchar(100) UNIQUE NOT NULL
);

CREATE TABLE ponto.Departamento (
  id SERIAL PRIMARY KEY,
  nome varchar(100) UNIQUE NOT NULL
);

CREATE TABLE ponto.Cargo (
  id SERIAL PRIMARY KEY,
  nome varchar(100) UNIQUE NOT NULL
);

CREATE TYPE GeneroEnum AS ENUM ('Masculino', 'Feminino', 'Outro');

CREATE TABLE ponto.Genero (
  id SERIAL PRIMARY KEY,
  nome GeneroEnum NOT NULL
);

CREATE TYPE TipoPerfilEnum AS ENUM ('Normal', 'RH', 'Admin');

CREATE TABLE ponto.TipoPerfil (
  id SERIAL PRIMARY KEY,
  nome TipoPerfilEnum UNIQUE NOT NULL DEFAULT 'Normal',
  pode_criar_usuario BOOLEAN NOT NULL,
  pode_editar_usuario BOOLEAN NOT NULL,
  pode_excluir_usuario BOOLEAN NOT NULL,
  pode_criar_registro BOOLEAN NOT NULL,
  pode_editar_registro BOOLEAN NOT NULL,
  pode_excluir_registro BOOLEAN NOT NULL,
  pode_alterar_configuracoes BOOLEAN NOT NULL
);

CREATE TABLE ponto.Perfil (
  id SERIAL PRIMARY KEY,
  tipo INT NOT NULL,
  FOREIGN KEY (tipo) REFERENCES ponto.TipoPerfil(id)
);

CREATE TABLE ponto.Horario (
  id SERIAL PRIMARY KEY,
  horario_entrada TIME NOT NULL,
  entrada_inicio TIME NOT NULL,
  entrada_fim TIME NOT NULL,
  saida TIME NOT NULL,
  saida_inicio TIME NOT NULL,
  saida_fim TIME NOT NULL,
  tem_intervalo BOOLEAN NOT NULL
);

CREATE TABLE ponto.Intervalo (
  id SERIAL PRIMARY KEY,
  horario INT NOT NULL,
  horario_intervalo TIME NOT NULL,
  inicio_intervalo TIME NOT NULL,
  fim_intervalo TIME NOT NULL,
  FOREIGN KEY (horario) REFERENCES ponto.Horario(id)
);

CREATE TABLE ponto.Jornada (
  id SERIAL PRIMARY KEY,
  nome varchar(100) NOT NULL,
  horario INT NOT NULL,
  FOREIGN KEY (horario) REFERENCES ponto.Horario(id)
);

CREATE TABLE ponto.Usuario (
  id SERIAL PRIMARY KEY,
  nome varchar(100) NOT NULL,
  cpf varchar(11) UNIQUE NOT NULL,
  pis varchar(15) UNIQUE NOT NULL,
  matricula varchar(8) UNIQUE NOT NULL,
  pin varchar(4) UNIQUE NOT NULL,
  genero INT NOT NULL,
  data_nascimento DATE NOT NULL,
  departamento INT,
  cargo INT,
  data_contratacao DATE NOT NULL,
  regime INT,
  ativo BOOLEAN,
  folga_feriado BOOLEAN,
  senha varchar(100) NOT NULL,
  jornada INT,
  perfil INT,
  refresh_token VARCHAR(255),
  token_binding_key VARCHAR(255),
  ultimo_acesso TIMESTAMP,
  FOREIGN KEY (genero) REFERENCES ponto.Genero(id),
  FOREIGN KEY (departamento) REFERENCES ponto.Departamento(id),
  FOREIGN KEY (cargo) REFERENCES ponto.Cargo(id),
  FOREIGN KEY (regime) REFERENCES ponto.Regime(id),
  FOREIGN KEY (jornada) REFERENCES ponto.Jornada(id),
  FOREIGN KEY (perfil) REFERENCES ponto.Perfil(id)
);

CREATE TABLE ponto.Motivo (
  id SERIAL PRIMARY KEY,
  motivo varchar(100) UNIQUE NOT NULL
);

CREATE TABLE ponto.Dispensa (
  id SERIAL PRIMARY KEY,
  usuario INT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  motivo INT,
  data_registro DATE NOT NULL,
  responsavel varchar(100) NOT NULL,
  codigo varchar(20) UNIQUE NOT NULL,
  FOREIGN KEY (usuario) REFERENCES ponto.Usuario(id),
  FOREIGN KEY (motivo) REFERENCES ponto.Motivo(id)
);

CREATE TABLE ponto.HoraExtra (
  id SERIAL PRIMARY KEY,
  usuario INT NOT NULL,
  cargo INT NOT NULL,
  regime INT NOT NULL,
  data DATE NOT NULL,
  horas_extras_min INT NOT NULL,
  horario INT NOT NULL,
  FOREIGN KEY (usuario) REFERENCES ponto.Usuario(id),
  FOREIGN KEY (cargo) REFERENCES ponto.Cargo(id),
  FOREIGN KEY (regime) REFERENCES ponto.Regime(id),
  FOREIGN KEY (horario) REFERENCES ponto.Horario(id)
);

CREATE TYPE TipoRegistroEnum AS ENUM ('Entrada', 'Saída');

CREATE TABLE ponto.TipoRegistro (
  id SERIAL PRIMARY KEY, 
  tipo TipoRegistroEnum UNIQUE NOT NULL
);

CREATE TABLE ponto.Registro (
  id SERIAL PRIMARY KEY,
  usuario INT NOT NULL,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  localizacao VARCHAR(255),
  tipo INT NOT NULL,
  FOREIGN KEY (usuario) REFERENCES ponto.Usuario(id),
  FOREIGN KEY (tipo) REFERENCES ponto.TipoRegistro(id)
);

CREATE TABLE ponto.Comprovante (
  id SERIAL PRIMARY KEY,
  usuario INT NOT NULL,
  registro INT NOT NULL, 
  data DATE NOT NULL,
  hora TIME NOT NULL, 
  FOREIGN KEY (usuario) REFERENCES ponto.Usuario(id),
  FOREIGN KEY (registro) REFERENCES ponto.Registro(id)
);

CREATE TYPE StatusEnum AS ENUM ('Pendente', 'Aprovado', 'Rejeitado');

CREATE TABLE ponto.Status (
  id SERIAL PRIMARY KEY,
  nome StatusEnum UNIQUE NOT NULL
);

CREATE TABLE ponto.SolicitacaoAbono (
  id SERIAL PRIMARY KEY,
  usuario INT NOT NULL,
  data_solicitacao DATE NOT NULL,
  horario INT NOT NULL,
  descricao varchar(255),
  status INT NOT NULL,
  resposta varchar(255),
  responsavel INT,
  FOREIGN KEY (usuario) REFERENCES ponto.Usuario(id),
  FOREIGN KEY (horario) REFERENCES ponto.Horario(id),
  FOREIGN KEY (status) REFERENCES ponto.Status(id),
  FOREIGN KEY (responsavel) REFERENCES ponto.Usuario(id)
);

CREATE TYPE RepTipo AS ENUM ('Hardware', 'Software');

CREATE TABLE ponto.RepTipo (
  id SERIAL PRIMARY KEY,
  tipo RepTipo NOT NULL
);

CREATE TABLE ponto.Rep (
  id SERIAL PRIMARY KEY,
  rep_tipo INT NOT NULL,
  FOREIGN KEY (rep_tipo) REFERENCES ponto.RepTipo(id)
);

CREATE TABLE ponto.RepA (
  id SERIAL PRIMARY KEY,
  rep_id INT,
  nome varchar(100) NOT NULL,
  local varchar(255) NOT NULL,
  marca varchar(100) NOT NULL,
  ip varchar(15) NOT NULL,
  mask varchar(15) NOT NULL,
  porta INT NOT NULL,
  ativo BOOLEAN NOT NULL,
  NFR varchar(50) NOT NULL,
  model varchar(100) NOT NULL,
  senha varchar(100) NOT NULL,
  FOREIGN KEY (rep_id) REFERENCES ponto.Rep(id) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE ponto.RepP (
  id SERIAL PRIMARY KEY,
  rep_id INT,
  nome varchar(100) NOT NULL,
  registro_software varchar(100) NOT NULL,
  FOREIGN KEY (rep_id) REFERENCES ponto.Rep(id) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE ponto.Justificativa (
  id SERIAL PRIMARY KEY,
  tipo varchar(30) UNIQUE NOT NULL,
  valor_outros varchar(255)
);

CREATE TABLE ponto.RegistroAbono (
  id SERIAL PRIMARY KEY,
  usuario INT NOT NULL,
  data_pedido DATE NOT NULL,
  justificativa INT,
  data_requisicao DATE NOT NULL,
  responsavel INT,
  cod_solicitacao INT,
  registro INT NOT NULL,
  FOREIGN KEY (usuario) REFERENCES ponto.Usuario(id),
  FOREIGN KEY (justificativa) REFERENCES ponto.Justificativa(id),
  FOREIGN KEY (responsavel) REFERENCES ponto.Usuario(id),
  FOREIGN KEY (registro) REFERENCES ponto.Registro(id)
);

CREATE TABLE ponto.Feriados (
  id SERIAL PRIMARY KEY,
  nome varchar(100) NOT NULL,
  data DATE NOT NULL
);

CREATE TABLE ponto.LogsBancoDeDados (
  id SERIAL PRIMARY KEY,
  tabela_afetada varchar(100) NOT NULL,
  tipo_operacao varchar(10) NOT NULL,
  mensagem TEXT NOT NULL,
  usuario INT NOT NULL,
  data_alteracao TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (usuario) REFERENCES ponto.Usuario(id)
);

CREATE INDEX idx_usuario_cpf ON ponto.Usuario (cpf);
CREATE INDEX idx_usuario_data_contratacao ON ponto.Usuario (data_contratacao);
CREATE INDEX idx_usuario_senha ON ponto.Usuario (senha);
CREATE INDEX idx_usuario_ativo ON ponto.Usuario (ativo);
CREATE INDEX idx_regime_nome ON ponto.Regime (nome);
CREATE INDEX idx_departamento_nome ON ponto.Departamento (nome);
CREATE INDEX idx_cargo_nome ON ponto.Cargo (nome);
CREATE INDEX idx_genero_nome ON ponto.Genero (nome);
CREATE INDEX idx_tipoPerfil_nome ON ponto.TipoPerfil (nome);
CREATE INDEX idx_jornada_nome ON ponto.Jornada (nome);
CREATE INDEX idx_motivo ON ponto.Motivo (motivo);
CREATE INDEX idx_feriados_nome ON ponto.Feriados (nome);
CREATE INDEX idx_status_nome ON ponto.Status (nome);

CREATE OR REPLACE FUNCTION ponto.log_changes() RETURNS TRIGGER AS $$
BEGIN
  CASE
    WHEN TG_OP = 'INSERT' THEN
      INSERT INTO ponto.LogsBancoDeDados (tabela_afetada, tipo_operacao, mensagem, usuario)
      VALUES (TG_TABLE_NAME, 'INSERT', 'Inserção feita na tabela ' || TG_TABLE_NAME || ' - ID: ' || NEW.id, NEW.id);
    WHEN TG_OP = 'UPDATE' THEN
      INSERT INTO ponto.LogsBancoDeDados (tabela_afetada, tipo_operacao, mensagem, usuario)
      VALUES (TG_TABLE_NAME, 'UPDATE',
        'Atualização feita na tabela ' || TG_TABLE_NAME || ' - ID: ' || NEW.id ||
        ' | Detalhes: ' || to_jsonb(NEW), CURRENT_USER);
    WHEN TG_OP = 'DELETE' THEN
      UPDATE ponto.Usuario
      SET ativo = FALSE
      WHERE id = OLD.id;
      INSERT INTO ponto.LogsBancoDeDados (tabela_afetada, tipo_operacao, mensagem, usuario)
      VALUES (TG_TABLE_NAME, 'DELETE', 'Inativação feita na tabela ' || TG_TABLE_NAME || ' - ID: ' || OLD.id, CURRENT_USER);
  END CASE;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ponto_changes ON ponto.Usuario;
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'ponto_changes') THEN
    CREATE TRIGGER ponto_changes
    AFTER INSERT OR UPDATE OR DELETE ON ponto.Usuario
    FOR EACH ROW
    EXECUTE FUNCTION ponto.log_changes();
  END IF;
END $$;

-- Inserção de TipoPerfil
INSERT INTO ponto.TipoPerfil (nome, pode_criar_usuario, pode_editar_usuario, pode_excluir_usuario, pode_criar_registro, pode_editar_registro, pode_excluir_registro, pode_alterar_configuracoes)
VALUES 
  ('Normal', TRUE, TRUE, FALSE, TRUE, FALSE, FALSE, FALSE),
  ('RH', TRUE, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE),
  ('Admin', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);

-- Inserção de Genero
INSERT INTO ponto.Genero (nome) VALUES 
  ('Masculino'),
  ('Feminino'),
  ('Outro');

-- Inserção de Status
INSERT INTO ponto.Status (nome) VALUES
  ('Pendente'), 
  ('Aprovado'),
  ('Rejeitado');

-- Inserção de RepTipo
INSERT INTO ponto.RepTipo (tipo) VALUES
  ('Hardware'),
  ('Software');

-- Inserção de Perfis
INSERT INTO ponto.Perfil (tipo) VALUES (1); 
INSERT INTO ponto.Perfil (tipo) VALUES (2); 
INSERT INTO ponto.Perfil (tipo) VALUES (3); 

-- Inserção de Regime
INSERT INTO ponto.Regime (nome) VALUES ('Test');

-- Inserção de Horário
INSERT INTO ponto.Horario (
  horario_entrada,
  entrada_inicio,
  entrada_fim,
  saida,
  saida_inicio,
  saida_fim,
  tem_intervalo
) VALUES (
  '09:00:00',
  '08:45:00',
  '09:15:00',
  '18:00:00',
  '17:45:00',
  '18:15:00',
  FALSE
);

-- Inserção de Jornada
INSERT INTO ponto.Jornada (nome, horario)
VALUES ('Test', 1);

-- Inserção de Departamento
INSERT INTO ponto.Departamento (nome)
VALUES ('Test');

-- Inserção de Cargo
INSERT INTO ponto.Cargo (nome)
VALUES ('Test');

-- Inserção de Usuário 'admin'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM ponto.Usuario WHERE nome = 'admin') THEN
    INSERT INTO ponto.Usuario (
      nome,
      cpf,
      pis,
      matricula,
      pin,
      genero,
      data_nascimento,
      departamento,
      cargo,
      data_contratacao,
      regime,
      ativo,
      folga_feriado,
      senha,
      jornada,
      perfil
    ) VALUES (
      'admin',
      '0000',
      '0000',
      '0000',
      '0000',
      1,
      '1990-01-01',
      1, 
      1, 
      '2023-01-01',
      1, 
      true,
      false,
      'senha_admin',
      1,
      3
    );
  END IF;
END $$;
-- Inserção de Usuário 'test'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM ponto.Usuario WHERE nome = 'test') THEN
    INSERT INTO ponto.Usuario (
      nome,
      cpf,
      pis,
      matricula,
      pin,
      genero,
      data_nascimento,
      departamento,
      cargo,
      data_contratacao,
      regime,
      ativo,
      folga_feriado,
      senha,
      jornada,
      perfil
    ) VALUES (
      'test',
      '0001',
      '0001',
      '0001',
      '0001',
      1,
      '1990-01-01',
      1, 
      1, 
      '2023-01-01',
      1,
      true,
      false,
      'senha_test',
      1,
      1
    );
  END IF;
END $$;
