ALTER TABLE "public"."company_licenses" ADD COLUMN "underwriting_data_source" text;
ALTER TABLE "public"."company_licenses" ALTER COLUMN "underwriting_data_source" DROP NOT NULL;
