alter table "public"."bank_accounts"
  add constraint "bank_accounts_bank_instructions_file_id_fkey"
  foreign key ("bank_instructions_file_id")
  references "public"."files"
  ("id") on update restrict on delete restrict;
