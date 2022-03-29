ALTER TABLE "public"."payments" ADD COLUMN "resource_type" text;
ALTER TABLE "public"."payments" ALTER COLUMN "resource_type" DROP NOT NULL;
