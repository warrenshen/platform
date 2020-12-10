CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."purchase_order_line_items"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "purchase_order_id" uuid NOT NULL, "item" text NOT NULL, "description" text, "num_units" integer NOT NULL, "unit" text NOT NULL, "price_per_unit" integer NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON UPDATE restrict ON DELETE restrict);
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
CREATE TRIGGER "set_public_purchase_order_line_items_updated_at"
BEFORE UPDATE ON "public"."purchase_order_line_items"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_purchase_order_line_items_updated_at" ON "public"."purchase_order_line_items" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
