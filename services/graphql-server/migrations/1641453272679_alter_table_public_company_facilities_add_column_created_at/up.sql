ALTER TABLE "public"."company_facilities" ADD COLUMN "created_at" timestamptz NOT NULL DEFAULT now();
