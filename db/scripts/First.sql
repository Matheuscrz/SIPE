--Trigger para consultar o id da permissão padrão
CREATE OR REPLACE FUNCTION get_default_permission_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM point.permissions WHERE name = 'Normal');
END;
$$ LANGUAGE plpgsql;