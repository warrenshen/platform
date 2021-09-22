ALTER TABLE "public"."company_licenses" ADD COLUMN "license_type" text;
ALTER TABLE "public"."company_licenses" ALTER COLUMN "license_type" DROP NOT NULL;
