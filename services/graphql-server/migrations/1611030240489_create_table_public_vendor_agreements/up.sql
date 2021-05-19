CREATE TABLE "public"."vendor_agreements"("company_id" uuid NOT NULL, "vendor_id" uuid NOT NULL, "agreement_file_id" uuid NOT NULL, PRIMARY KEY ("company_id","vendor_id") , FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("vendor_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("agreement_file_id") REFERENCES "public"."files"("id") ON UPDATE restrict ON DELETE restrict); COMMENT ON TABLE "public"."vendor_agreements" IS E'Agreements that companies have with a vendor';