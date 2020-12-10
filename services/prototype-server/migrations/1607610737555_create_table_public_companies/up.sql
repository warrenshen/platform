CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."companies"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" text NOT NULL, "employer_identification_number" text, "address" text, "country" text, "state" text, "city" text, "zip_code" text, PRIMARY KEY ("id") );
