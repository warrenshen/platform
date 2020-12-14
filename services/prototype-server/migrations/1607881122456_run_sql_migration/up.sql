CREATE OR REPLACE VIEW "public"."vendors" AS 
 SELECT companies.id,
    companies.name,
    companies.dba_name,
    companies.address,
    companies.country,
    companies.state,
    companies.city,
    companies.zip_code,
    companies.phone_number,
    companies.contact_email_address
   FROM companies
   JOIN company_vendor_partnerships
   ON companies.id = company_vendor_partnerships.vendor_id;
