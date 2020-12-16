ALTER TABLE ONLY "public"."purchase_orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."purchase_orders" ALTER COLUMN "status" DROP NOT NULL;
