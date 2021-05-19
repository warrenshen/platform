CREATE OR REPLACE FUNCTION update_company_settings_for_new_company() RETURNS TRIGGER AS
  $$
  BEGIN
    UPDATE company_settings SET company_id = NEW.id WHERE NEW.company_settings_id = company_settings.id;
    RETURN NULL;
  END;
  $$ LANGUAGE PLPGSQL;

CREATE TRIGGER update_company_settings_for_new_company
  AFTER INSERT ON companies
  FOR EACH ROW
  EXECUTE PROCEDURE update_company_settings_for_new_company();
