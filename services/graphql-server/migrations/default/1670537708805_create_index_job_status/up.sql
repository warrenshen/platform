CREATE  INDEX "job_status" on
  "public"."async_jobs" using btree ("status", "is_deleted");
