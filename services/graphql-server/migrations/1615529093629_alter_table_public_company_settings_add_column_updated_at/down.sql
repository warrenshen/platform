DROP TRIGGER IF EXISTS "set_public_company_settings_updated_at" ON "public"."company_settings";
ALTER TABLE "public"."company_settings" DROP COLUMN "updated_at";
