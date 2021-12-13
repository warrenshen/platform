alter table "public"."metrc_analysis_summaries"
           add constraint "metrc_analysis_summaries_facility_row_id_fkey"
           foreign key ("facility_row_id")
           references "public"."company_facilities"
           ("id") on update restrict on delete restrict;
