ALTER TABLE "public"."ebba_applications" ADD COLUMN "approved_by_user_id" uuid NULL;
ALTER TABLE "public"."ebba_applications" ADD CONSTRAINT "ebba_applications_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"  ("id") ON UPDATE restrict ON DELETE restrict;

ALTER TABLE "public"."ebba_applications" ADD COLUMN "rejected_by_user_id" uuid NULL;
ALTER TABLE "public"."ebba_applications" ADD CONSTRAINT "ebba_applications_rejected_by_user_id_fkey" FOREIGN KEY ("rejected_by_user_id") REFERENCES "public"."users"  ("id") ON UPDATE restrict ON DELETE restrict;

AlTER TABLE "public"."ebba_applications" ADD column "bank_note" TEXT NULL;
