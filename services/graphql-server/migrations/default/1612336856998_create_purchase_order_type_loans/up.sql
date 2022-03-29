CREATE
OR REPLACE VIEW "public"."purchase_order_type_loans" AS
SELECT
  *
FROM
  loans
WHERE
  (loans.loan_type = 'purchase_order');
