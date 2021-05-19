ALTER TABLE "public"."company_vendor_partnerships" ADD COLUMN "created_at" timestamptz NOT NULL DEFAULT now();
