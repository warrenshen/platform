alter table "public"."payments"
           add constraint "payments_recipient_bank_account_id_fkey"
           foreign key ("recipient_bank_account_id")
           references "public"."bank_accounts"
           ("id") on update restrict on delete restrict;
