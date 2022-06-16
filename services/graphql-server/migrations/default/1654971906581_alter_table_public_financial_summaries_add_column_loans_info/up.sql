alter table "public"."financial_summaries" add column "loans_info" json
 null default json_build_object();
