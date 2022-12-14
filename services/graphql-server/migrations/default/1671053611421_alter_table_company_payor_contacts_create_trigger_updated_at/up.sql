CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_company_payor_contacts_updated_at"
BEFORE UPDATE ON "public"."company_payor_contacts"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_company_payor_contacts_updated_at" ON "public"."company_payor_contacts" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
