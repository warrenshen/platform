CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."company_deliveries"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "company_id" uuid NOT NULL, "license_number" text NOT NULL, "us_state" text NOT NULL, "vendor_id" uuid, "payor_id" uuid, "transfer_row_id" uuid NOT NULL, "transfer_type" text NOT NULL, "delivery_row_id" uuid NOT NULL, "delivery_type" text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("delivery_row_id") REFERENCES "public"."metrc_deliveries"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("transfer_row_id") REFERENCES "public"."metrc_transfers"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("vendor_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("payor_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("id"), UNIQUE ("us_state", "transfer_row_id", "delivery_row_id"));
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
CREATE TRIGGER "set_public_company_deliveries_updated_at"
BEFORE UPDATE ON "public"."company_deliveries"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_company_deliveries_updated_at" ON "public"."company_deliveries" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
