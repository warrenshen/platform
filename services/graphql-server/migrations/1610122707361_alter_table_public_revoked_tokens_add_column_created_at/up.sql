ALTER TABLE "public"."revoked_tokens" ADD COLUMN "created_at" timestamptz NOT NULL DEFAULT now();
