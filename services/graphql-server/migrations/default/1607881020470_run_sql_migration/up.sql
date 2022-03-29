CREATE VIEW vendors AS
  SELECT id, name, dba_name, address, country, state, city, zip_code, phone_number, contact_email_address
  FROM companies;
