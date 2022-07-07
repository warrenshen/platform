CREATE TABLE "public"."blaze_preapprovals" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "external_blaze_company_id" text NOT NULL, "external_blaze_shop_id" text NOT NULL, "max_credit_limit" numeric NOT NULL, "annual_interest_rate" numeric NOT NULL, "expiration_date" date NOT NULL, PRIMARY KEY ("id") , UNIQUE ("external_blaze_company_id", "external_blaze_shop_id", "expiration_date"));
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
CREATE TRIGGER "set_public_blaze_preapprovals_updated_at"
BEFORE UPDATE ON "public"."blaze_preapprovals"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_blaze_preapprovals_updated_at" ON "public"."blaze_preapprovals" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
