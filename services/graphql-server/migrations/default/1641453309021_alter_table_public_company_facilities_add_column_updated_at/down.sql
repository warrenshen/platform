DROP TRIGGER IF EXISTS "set_public_company_facilities_updated_at" ON "public"."company_facilities";
ALTER TABLE "public"."company_facilities" DROP COLUMN "updated_at";
