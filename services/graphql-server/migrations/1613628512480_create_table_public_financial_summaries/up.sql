CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."financial_summaries"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "company_id" uuid NOT NULL, "total_limit" numeric NOT NULL, "total_outstanding_principal" numeric NOT NULL, "total_outstanding_interest" numeric NOT NULL, "total_principal_in_requested_state" numeric NOT NULL, "available_limit" numeric NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("company_id"), UNIQUE ("id"));
