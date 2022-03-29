CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."company_facilities"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "company_id" uuid NOT NULL, "name" text NOT NULL, "address" text NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("company_id", "name"));
