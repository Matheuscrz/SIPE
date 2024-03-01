CREATE OR REPLACE FUNCTION check_permission() RETURNS TRIGGER AS $$
BEGIN
    IF(NEW.permission_id = '')