CREATE OR REPLACE VIEW "public"."purchase_order_loan_disbursements" AS 
 SELECT payments.*
   FROM payments
  WHERE (resource_type = 'payments');
