alter table "public"."company_partnership_invitations"
  add constraint "company_partnership_invitations_submitted_by_user_id_fkey"
  foreign key ("submitted_by_user_id")
  references "public"."users"
  ("id") on update restrict on delete restrict;
