ALTER TABLE "public"."ebba_applications" ADD COLUMN "expires_at" date NULL;
-- Applications expire on the 15th of the following month
update "public"."ebba_applications" set expires_at = date_trunc('month', application_date) + interval '1 month' + interval '14 days';
-- Now set the column not to allow nulls
alter table "public"."ebba_applications" alter column "expires_at" set not null;
