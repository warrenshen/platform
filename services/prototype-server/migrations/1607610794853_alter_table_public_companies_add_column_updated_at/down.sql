DROP TRIGGER IF EXISTS "set_public_companies_updated_at" ON "public"."companies";
ALTER TABLE "public"."companies" DROP COLUMN "updated_at";
