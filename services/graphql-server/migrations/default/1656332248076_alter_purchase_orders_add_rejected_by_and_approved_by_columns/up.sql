ALTER TABLE "public"."purchase_orders" ADD column "approved_by" uuid NULL;
ALTER TABLE "public"."purchase_orders"
  ADD CONSTRAINT "purchase_orders_approved_by_fkey"
  FOREIGN KEY ("approved_by")
  REFERENCES "public"."users"
  ("id") ON UPDATE restrict ON DELETE restrict;

ALTER TABLE "public"."purchase_orders" ADD column "rejected_by" uuid NULL;
ALTER TABLE "public"."purchase_orders"
  ADD CONSTRAINT "purchase_orders_rejected_by_fkey"
  FOREIGN KEY ("rejected_by")
  REFERENCES "public"."users"
  ("id") ON UPDATE restrict ON DELETE restrict;
