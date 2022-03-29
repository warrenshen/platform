ALTER TABLE "public"."invoices" ALTER COLUMN "is_cannabis" DROP NOT NULL;
COMMENT ON COLUMN "public"."invoices"."is_cannabis" IS E'This field is used for the Purchase Money Financing product type but NOT for the Invoice Financing product type';
