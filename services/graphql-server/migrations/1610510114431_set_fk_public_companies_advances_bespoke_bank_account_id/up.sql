alter table "public"."companies"
           add constraint "companies_advances_bespoke_bank_account_id_fkey"
           foreign key ("advances_bespoke_bank_account_id")
           references "public"."bank_accounts"
           ("id") on update restrict on delete restrict;
