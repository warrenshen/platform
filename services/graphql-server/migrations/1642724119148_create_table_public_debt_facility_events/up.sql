CREATE TABLE "public"."debt_facility_events" ("id" serial NOT NULL, "loan_report_id" uuid NOT NULL, "event_category" text NOT NULL, "event_date" date NOT NULL, "event_comments" text, "event_amount" numeric, PRIMARY KEY ("id") , FOREIGN KEY ("loan_report_id") REFERENCES "public"."loan_reports"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("id"));
