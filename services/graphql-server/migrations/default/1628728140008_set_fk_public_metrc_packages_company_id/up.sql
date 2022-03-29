alter table "public"."metrc_packages"
           add constraint "metrc_packages_company_id_fkey"
           foreign key ("company_id")
           references "public"."companies"
           ("id") on update restrict on delete restrict;
