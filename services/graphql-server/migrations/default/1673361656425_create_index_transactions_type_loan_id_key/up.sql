CREATE  INDEX "transactions_type_loan_id_key" on
  "public"."transactions" using btree ("loan_id", "type");
