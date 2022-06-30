alter table "public"."purchase_orders" rename column "rejected_by" to "rejected_by_user_id";
alter table "public"."purchase_orders" rename column "approved_by" to "approved_by_user_id";
