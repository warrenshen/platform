alter table "public"."financial_summaries" add column "created_at" timestamptz
 null default now();
