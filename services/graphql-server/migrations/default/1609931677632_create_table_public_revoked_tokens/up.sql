CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."revoked_tokens"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "jti" text NOT NULL, PRIMARY KEY ("id") , UNIQUE ("id"));
