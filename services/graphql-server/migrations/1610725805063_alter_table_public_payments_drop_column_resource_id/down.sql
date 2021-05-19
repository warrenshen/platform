ALTER TABLE "public"."payments" ADD COLUMN "resource_id" uuid;
ALTER TABLE "public"."payments" ALTER COLUMN "resource_id" DROP NOT NULL;
