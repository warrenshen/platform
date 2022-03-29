CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."company_banks"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" text NOT NULL, "account_name" text NOT NULL, "account_number" Text NOT NULL, "routing_number" text NOT NULL, "notes" text, "confirmed_at" timestamptz, "company_id" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict);