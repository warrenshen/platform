DROP TRIGGER IF EXISTS "set_public_line_of_credits_updated_at" ON "public"."line_of_credits";
ALTER TABLE "public"."line_of_credits" DROP COLUMN "updated_at";
