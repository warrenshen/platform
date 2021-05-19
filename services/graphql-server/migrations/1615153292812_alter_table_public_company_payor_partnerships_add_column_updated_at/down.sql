DROP TRIGGER IF EXISTS "set_public_company_payor_partnerships_updated_at" ON "public"."company_payor_partnerships";
ALTER TABLE "public"."company_payor_partnerships" DROP COLUMN "updated_at";
