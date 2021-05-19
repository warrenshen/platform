CREATE VIEW vendors AS
  SELECT id, name, dba_name, address, phone_number
    FROM companies
    WHERE is_vendor = true;
