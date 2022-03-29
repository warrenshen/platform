CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."users"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "email" text NOT NULL, "first_name" text NOT NULL, "last_name" text NOT NULL, "full_name" text NOT NULL, PRIMARY KEY ("id") );
