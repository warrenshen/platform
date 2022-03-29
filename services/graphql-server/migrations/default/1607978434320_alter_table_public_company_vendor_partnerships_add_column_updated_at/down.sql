DROP TRIGGER IF EXISTS "set_public_company_vendor_partnerships_updated_at" ON "public"."company_vendor_partnerships";
ALTER TABLE "public"."company_vendor_partnerships" DROP COLUMN "updated_at";
