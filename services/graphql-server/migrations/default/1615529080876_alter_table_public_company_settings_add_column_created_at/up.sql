ALTER TABLE "public"."company_settings" ADD COLUMN "created_at" timestamptz NOT NULL DEFAULT now();
