ALTER TABLE "public"."company_licenses" ADD COLUMN "created_at" timestamptz NULL DEFAULT now();
