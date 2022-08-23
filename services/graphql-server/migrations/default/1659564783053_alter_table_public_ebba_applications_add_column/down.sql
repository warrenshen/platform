ALTER TABLE "public"."ebba_applications" DROP CONSTRAINT IF EXISTS "ebba_applications_approved_by_user_id_fkey";
ALTER TABLE "public"."ebba_applications" DROP COLUMN IF EXISTS "approved_by_user_id";

ALTER TABLE "public"."ebba_applications" DROP CONSTRAINT IF EXISTS "ebba_applications_rejected_by_user_id_fkey";
ALTER TABLE "public"."ebba_applications" DROP COLUMN IF EXISTS "rejected_by_user_id";

ALTER TABLE "public"."ebba_applications" DROP COLUMN IF EXISTS "bank_note";
