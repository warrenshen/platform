ALTER TABLE "public"."company_licenses" ADD COLUMN "license_link" text;
ALTER TABLE "public"."company_licenses" ALTER COLUMN "license_link" DROP NOT NULL;
