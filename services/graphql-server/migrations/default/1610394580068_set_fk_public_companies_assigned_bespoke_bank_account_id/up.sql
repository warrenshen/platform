alter table "public"."companies"
           add constraint "companies_assigned_bespoke_bank_account_id_fkey"
           foreign key ("assigned_bespoke_bank_account_id")
           references "public"."bank_accounts"
           ("id") on update restrict on delete restrict;
