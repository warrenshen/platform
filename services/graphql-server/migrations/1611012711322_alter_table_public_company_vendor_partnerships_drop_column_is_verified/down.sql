ALTER TABLE "public"."company_vendor_partnerships" ADD COLUMN "is_verified" bool;
ALTER TABLE "public"."company_vendor_partnerships" ALTER COLUMN "is_verified" DROP NOT NULL;
ALTER TABLE "public"."company_vendor_partnerships" ALTER COLUMN "is_verified" SET DEFAULT false;
