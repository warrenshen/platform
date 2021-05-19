ALTER TABLE "public"."purchase_order_files" ADD COLUMN "id" uuid;
ALTER TABLE "public"."purchase_order_files" ALTER COLUMN "id" DROP NOT NULL;
ALTER TABLE "public"."purchase_order_files" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
