ALTER TABLE "public"."companies" ADD COLUMN "is_vendor" bool;
ALTER TABLE "public"."companies" ALTER COLUMN "is_vendor" DROP NOT NULL;
ALTER TABLE "public"."companies" ALTER COLUMN "is_vendor" SET DEFAULT false;
