UPDATE "public"."companies"
   SET company_type = 'vendor'
 WHERE is_vendor = 't'
;

UPDATE "public"."companies"
   SET company_type = 'customer'
 WHERE company_type IS NULL
;

ALTER TABLE "public"."companies" DROP COLUMN "is_vendor" CASCADE;
