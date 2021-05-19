CREATE OR REPLACE VIEW "public"."payors" AS 
 SELECT companies.id,
    companies.name,
    companies.employer_identification_number,
    companies.address,
    companies.country,
    companies.state,
    companies.city,
    companies.zip_code,
    companies.created_at,
    companies.updated_at,
    companies.dba_name,
    companies.phone_number,
    companies.company_settings_id,
    companies.contract_id,
    companies.identifier,
    companies.latest_loan_identifier,
    companies.needs_balance_recomputed,
    companies.company_type
   FROM companies
  WHERE (companies.is_payor = true);
