CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."invoices"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "company_id" uuid NOT NULL, "payor_id" uuid NOT NULL, "invoice_number" text NOT NULL, "subtotal_amount" numeric NOT NULL, "total_amount" numeric NOT NULL, "taxes_amount" numeric NOT NULL, "invoice_date" date NOT NULL, "invoice_due_date" date NOT NULL, "advance_date" date NOT NULL, "status" text NOT NULL DEFAULT 'drafted', "approved_at" date, "funded_at" date, "rejected_at" date, "rejection_note" text, "is_cannabis" boolean NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("payor_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("status") REFERENCES "public"."request_status"("value") ON UPDATE restrict ON DELETE restrict); COMMENT ON TABLE "public"."invoices" IS E'Maintains the collection of company invoices used for both Invoice Financing and PMF ';
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
CREATE TRIGGER "set_public_invoices_updated_at"
BEFORE UPDATE ON "public"."invoices"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_invoices_updated_at" ON "public"."invoices" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
