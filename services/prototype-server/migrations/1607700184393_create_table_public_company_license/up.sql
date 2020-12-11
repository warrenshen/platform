CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."company_license"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "company_id" uuid NOT NULL, "license_link" text NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict);
