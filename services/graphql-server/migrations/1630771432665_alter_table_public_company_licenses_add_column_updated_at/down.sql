DROP TRIGGER IF EXISTS "set_public_company_licenses_updated_at" ON "public"."company_licenses";
ALTER TABLE "public"."company_licenses" DROP COLUMN "updated_at";
