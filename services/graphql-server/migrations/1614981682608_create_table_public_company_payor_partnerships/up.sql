CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."company_payor_partnerships"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "company_id" uuid NOT NULL, "payor_id" uuid NOT NULL, "payor_agreement_id" uuid NOT NULL, "payor_license_id" uuid NOT NULL, "approved_at" timestamptz, PRIMARY KEY ("id") , FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("payor_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("payor_agreement_id") REFERENCES "public"."company_agreements"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("payor_license_id") REFERENCES "public"."company_licenses"("id") ON UPDATE restrict ON DELETE restrict);
