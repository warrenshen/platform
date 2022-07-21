ALTER TABLE "public"."company_settings" ADD COLUMN "underwriter_user_id" uuid NULL;
ALTER TABLE "public"."company_settings" ADD CONSTRAINT "underwriter" FOREIGN KEY ("underwriter_user_id") REFERENCES "public"."users"  ("id") ON UPDATE restrict ON DELETE restrict;
  
