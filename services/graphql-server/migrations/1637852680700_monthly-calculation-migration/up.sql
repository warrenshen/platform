CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS "public"."monthly_summary_calculations"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "company_id" uuid NOT NULL, "report_month" date NOT NULL, "minimum_payment" numeric NOT NULL, PRIMARY KEY ("id"), FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict );
