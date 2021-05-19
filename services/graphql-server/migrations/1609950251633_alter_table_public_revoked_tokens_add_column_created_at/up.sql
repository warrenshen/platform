ALTER TABLE "public"."revoked_tokens" ADD COLUMN "created_at" time with time zone NULL DEFAULT now();
