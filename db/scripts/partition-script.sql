CREATE EXTENSION IF NOT EXISTS cron;
-- Função para criar a próxima partição do mês
CREATE OR REPLACE FUNCTION ponto.create_next_month_partition() RETURNS VOID AS $$
DECLARE
    partition_name TEXT;
    start_date TIMESTAMP;
    end_date TIMESTAMP;
BEGIN
    start_date := DATE_TRUNC('MONTH', NOW());
    end_date := start_date + INTERVAL '1 month';
    partition_name := 'registro_' || TO_CHAR(start_date, 'YYYY_MM');

    IF NOT EXISTS (
        SELECT 1
        FROM pg_partitions
        WHERE tablename = 'registro' AND schemaname = 'ponto' AND partition_name = partition_name
    ) THEN
        EXECUTE 'CREATE TABLE ponto.' || partition_name ||
                ' PARTITION OF ponto.Registro FOR VALUES FROM (' || quote_literal(start_date) || ') TO (' || quote_literal(end_date) || ')';
        
        RAISE NOTICE 'Nova partição criada: %', partition_name;
    ELSE
        RAISE NOTICE 'A partição % já existe. Nenhuma ação necessária.', partition_name;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar a partição: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Função para agendar a criação da próxima partição no primeiro dia de cada mês
CREATE OR REPLACE FUNCTION ponto.schedule_next_month_partition_creation() RETURNS EVENT_TRIGGER AS $$
BEGIN
    PERFORM cron.schedule('0 0 1 * *', 'SELECT ponto.create_next_month_partition()');
END;
$$ LANGUAGE plpgsql;

-- Evento de Trigger para agendar a criação da próxima partição após comandos DDL
CREATE EVENT TRIGGER schedule_partition_creation
ON ddl_command_end
WHEN TAG IN ('CREATE TABLE ponto.Registro', 'ALTER TABLE ponto.Registro')
EXECUTE FUNCTION ponto.schedule_next_month_partition_creation();
