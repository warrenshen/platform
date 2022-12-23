ALTER TABLE "public"."bespoke_catalog_brands" ADD COLUMN "parent_company_id" UUID NULL;
ALTER TABLE "public"."bespoke_catalog_brands"
  ADD CONSTRAINT "bespoke_catalog_brands_parent_company_id_fkey"
  FOREIGN KEY ("parent_company_id")
  REFERENCES "public"."parent_companies"
  ("id") ON UPDATE RESTRICT ON DELETE RESTRICT;
CREATE INDEX "bespoke_catalog_brands_parent_company_id" ON "public"."bespoke_catalog_brands" USING BTREE ("parent_company_id");
