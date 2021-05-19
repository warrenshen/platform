CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."ebba_applications"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "company_id" uuid NOT NULL, "application_month" date NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "monthly_accounts_receivable" numeric NOT NULL, "monthly_inventory" numeric NOT NULL, "monthly_cash" numeric NOT NULL, PRIMARY KEY ("id") );
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
CREATE TRIGGER "set_public_ebba_applications_updated_at"
BEFORE UPDATE ON "public"."ebba_applications"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_ebba_applications_updated_at" ON "public"."ebba_applications" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
