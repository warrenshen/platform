alter table "public"."companies"
           add constraint "companies_contract_id_fkey"
           foreign key ("contract_id")
           references "public"."contracts"
           ("id") on update restrict on delete restrict;
