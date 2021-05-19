CREATE OR REPLACE VIEW "public"."purchase_order_loan_disbursements" AS 
 SELECT payments.id,
    payments.amount,
    payments.direction,
    payments.company_id,
    payments.type,
    payments.bespoke_bank_account_id,
    payments.company_bank_account_id,
    payments.submitted_at,
    payments.settled_at,
    payments.items_covered,
    payments.expected_settlement_date,
    payments.resource_type,
    payments.resource_id
   FROM payments
  WHERE (payments.resource_type = 'purchase_order_loans'::text);
