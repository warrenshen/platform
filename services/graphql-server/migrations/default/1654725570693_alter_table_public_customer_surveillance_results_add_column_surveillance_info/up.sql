alter table "public"."customer_surveillance_results" add column "surveillance_info" json null default json_build_object();
