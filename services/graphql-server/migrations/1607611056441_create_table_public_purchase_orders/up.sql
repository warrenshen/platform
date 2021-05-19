CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."purchase_orders"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "vendor_id" uuid NOT NULL, "currency" text NOT NULL DEFAULT 'USD', "delivery_date" date NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") );
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
CREATE TRIGGER "set_public_purchase_orders_updated_at"
BEFORE UPDATE ON "public"."purchase_orders"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_purchase_orders_updated_at" ON "public"."purchase_orders" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
