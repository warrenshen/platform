ALTER TABLE "public"."companies" ADD COLUMN "company_type" text;
ALTER TABLE "public"."companies" ALTER COLUMN "company_type" DROP NOT NULL;
ALTER TABLE "public"."companies" ADD CONSTRAINT companies_company_type_fkey FOREIGN KEY (company_type) REFERENCES "public"."company_type" (value) ON DELETE restrict ON UPDATE restrict;
