alter table "public"."line_of_credits"
           add constraint "line_of_credits_company_id_fkey"
           foreign key ("company_id")
           references "public"."companies"
           ("id") on update restrict on delete restrict;
