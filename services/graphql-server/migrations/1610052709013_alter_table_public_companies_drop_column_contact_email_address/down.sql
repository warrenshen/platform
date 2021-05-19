ALTER TABLE "public"."companies" ADD COLUMN "contact_email_address" text;
ALTER TABLE "public"."companies" ALTER COLUMN "contact_email_address" DROP NOT NULL;
