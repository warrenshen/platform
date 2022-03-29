CREATE OR REPLACE VIEW "public"."purchase_order_loans" AS 
 SELECT loans.id,
    loans.company_id,
    loans.amount,
    loans.maturity_date,
    loans.adjusted_maturity_date,
    loans.origination_date,
    loans.outstanding_principal_balance,
    loans.outstanding_interest,
    loans.outstanding_fees,
    loans.modified_by_user_id,
    loans.modified_at,
    loans.closed_at,
    loans.requested_at,
    loans.rejected_at,
    loans.rejected_by_user_id,
    loans.status,
    loans.notes,
    loans.rejection_notes,
    loans.requested_by_user_id,
    loans.artifact_id,
    loans.loan_type
   FROM loans
  WHERE (loans.loan_type = 'purchase_order'::text);
