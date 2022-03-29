CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."two_factor_tokens"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "form_info" json NOT NULL DEFAULT json_build_object(), PRIMARY KEY ("id") , UNIQUE ("id")); COMMENT ON TABLE "public"."two_factor_tokens" IS E'For building pages based on two-factor tokens';
