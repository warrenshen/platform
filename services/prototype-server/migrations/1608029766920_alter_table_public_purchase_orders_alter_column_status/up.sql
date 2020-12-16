ALTER TABLE ONLY "public"."purchase_orders" ALTER COLUMN "status" SET DEFAULT 'New';
ALTER TABLE "public"."purchase_orders" ALTER COLUMN "status" SET NOT NULL;
