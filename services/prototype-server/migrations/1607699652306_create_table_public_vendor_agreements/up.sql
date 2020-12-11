CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."vendor_agreements"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "company_id" uuid NOT NULL, "agreement_link" text NOT NULL, "marked_signed_at" timestamptz, PRIMARY KEY ("id") , FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict);
