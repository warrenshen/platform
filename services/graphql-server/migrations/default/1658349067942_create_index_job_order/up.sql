CREATE  INDEX "job_order" on
  "public"."async_jobs" using btree ("status", "is_high_priority", "created_at");
