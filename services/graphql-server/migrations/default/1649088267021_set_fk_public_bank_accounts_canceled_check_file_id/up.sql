alter table "public"."bank_accounts"
  add constraint "bank_accounts_canceled_check_file_id_fkey"
  foreign key ("canceled_check_file_id")
  references "public"."files"
  ("id") on update restrict on delete restrict;
