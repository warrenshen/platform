BEGIN;

INSERT INTO public.bank_accounts (id, bank_name, account_type, account_number, routing_number, verified_at)
  VALUES ('98971121-c132-4fc3-a921-5ae47ae5bb9a', 'Torrey Pines', 'Checking', '456456', '123123', '2020-12-15 04:50:24.284+00');

INSERT INTO public.bank_accounts (id, bank_name, account_type, account_number, routing_number, verified_at)
  VALUES ('98971121-c132-4fc3-a921-5ae47ae5bb9b', 'Colorado Safe Harbor', 'Checking', '456456', '123123', '2020-12-15 04:50:24.284+00');


INSERT INTO company_settings (id) VALUES ('b7f3fa9f-86b1-4e6b-9046-5d0c9f9b27c1');
INSERT INTO company_settings (id) VALUES ('b7f3fa9f-86b1-4e6b-9046-5d0c9f9b27c2');
INSERT INTO company_settings (id) VALUES ('b7f3fa9f-86b1-4e6b-9046-5d0c9f9b27c3');
INSERT INTO company_settings (id) VALUES ('b7f3fa9f-86b1-4e6b-9046-5d0c9f9b27c4');

INSERT INTO public.companies (id, name, employer_identification_number, address, country, state, city, zip_code, created_at, updated_at, dba_name, phone_number, company_type, company_settings_id)
  VALUES ('84b3cdd9-6764-43e6-bade-2701b824f1f0', 'Cannabis Cantina', NULL, '1002 Redwood Road', 'United States', 'California', 'San Francisco', '94114', '2020-12-15 04:49:46.347155+00', '2020-12-15 04:51:04.747642+00', NULL, '738-393-3939', 'vendor', 'b7f3fa9f-86b1-4e6b-9046-5d0c9f9b27c1');
INSERT INTO public.companies (id, name, employer_identification_number, address, country, state, city, zip_code, created_at, updated_at, dba_name, phone_number, company_type, company_settings_id)
  VALUES ('6c5e8e17-b807-4488-9e79-832106c36055', 'Kanna Kingdom', NULL, '342 Waller Street', 'United States', 'New York', 'New York', '92828', '2020-12-15 04:49:03.341418+00', '2020-12-15 04:51:16.588408+00', NULL, '219-202-2020', 'vendor', 'b7f3fa9f-86b1-4e6b-9046-5d0c9f9b27c2');
INSERT INTO public.companies (id, name, employer_identification_number, address, country, state, city, zip_code, created_at, updated_at, dba_name, phone_number, company_type, company_settings_id)
  VALUES ('8203c413-c93b-402a-8574-1bec9d30abea', 'Hemp Heaven', NULL, '420 Joint Street', 'United States', 'California', 'Los Angeles', '90045', '2020-12-16 04:49:03.341418+00', '2020-12-16 04:51:16.588408+00', NULL, '650-420-2021', 'vendor', 'b7f3fa9f-86b1-4e6b-9046-5d0c9f9b27c3');

INSERT INTO public.companies (id, identifier, name, employer_identification_number, address, country, state, city, zip_code, created_at, updated_at, dba_name, phone_number, company_type, company_settings_id)
  VALUES ('57ee8797-1d5b-4a90-83c9-84c740590e42', 'DIZ', 'Distributor, Inc.', '123123123', '30943 Townsend Street', 'United States', 'California', NULL, NULL, '2020-12-10 19:15:09.138557+00', '2020-12-23 22:58:29.707887+00', 'Distributorz', '839-939-3939', 'customer', 'b7f3fa9f-86b1-4e6b-9046-5d0c9f9b27c4');

UPDATE company_settings SET
  company_id = '84b3cdd9-6764-43e6-bade-2701b824f1f0',
  advances_bespoke_bank_account_id = '98971121-c132-4fc3-a921-5ae47ae5bb9a'
  WHERE id = 'b7f3fa9f-86b1-4e6b-9046-5d0c9f9b27c1';

UPDATE company_settings SET
  company_id = '6c5e8e17-b807-4488-9e79-832106c36055',
  advances_bespoke_bank_account_id = '98971121-c132-4fc3-a921-5ae47ae5bb9a'
  WHERE id = 'b7f3fa9f-86b1-4e6b-9046-5d0c9f9b27c2';

UPDATE company_settings SET
  company_id = '8203c413-c93b-402a-8574-1bec9d30abea',
  advances_bespoke_bank_account_id = '98971121-c132-4fc3-a921-5ae47ae5bb9a'
  WHERE id = 'b7f3fa9f-86b1-4e6b-9046-5d0c9f9b27c3';

UPDATE company_settings SET
  company_id = '57ee8797-1d5b-4a90-83c9-84c740590e42',
  collections_bespoke_bank_account_id = '98971121-c132-4fc3-a921-5ae47ae5bb9a',
  advances_bespoke_bank_account_id = '98971121-c132-4fc3-a921-5ae47ae5bb9a'
  WHERE id = 'b7f3fa9f-86b1-4e6b-9046-5d0c9f9b27c4';

INSERT INTO public.users (id, email, first_name, last_name, full_name, company_id, phone_number, password, role)
  VALUES ('094c8cca-3bc6-4fe0-be0e-a23858aca52b', 'jira+bank@bespokefinancial.com', 'Bank', '(Admin)', 'Bank (Admin)', NULL, NULL, '$pbkdf2-sha256$29000$.D.HEMI4JwRA6L231hrDOA$bz1ZGMai8N/kKOGKU043HNj0uw.LghdNH4kUO8BCVIA', 'bank_admin');
INSERT INTO public.users (id, email, first_name, last_name, full_name, company_id, phone_number, password, role)
  VALUES ('f0eac87d-d622-4075-9a3b-8af439cc14e7', 'jira+customer@bespokefinancial.com', 'Customer', '(Admin)', 'Customer (Admin)', '57ee8797-1d5b-4a90-83c9-84c740590e42', NULL, '$pbkdf2-sha256$29000$.D.HEMI4JwRA6L231hrDOA$bz1ZGMai8N/kKOGKU043HNj0uw.LghdNH4kUO8BCVIA', 'company_admin');

INSERT INTO public.bank_accounts (id, bank_name, account_type, account_number, routing_number, verified_at, company_id)
  VALUES ('98971121-c132-4fc3-a921-5ae47ae5bb9f', 'Chase', 'Checking', '456456', '123123', '2020-12-15 04:50:24.284+00', '6c5e8e17-b807-4488-9e79-832106c36055');
INSERT INTO public.bank_accounts (id, bank_name, account_type, account_number, routing_number, verified_at, company_id)
  VALUES ('ac62427f-d3fe-4fba-8fb2-9624d22dc070', 'Wells Fargo', 'Checking', '918383839', '18883838', '2020-12-15 04:50:52.035+00', '84b3cdd9-6764-43e6-bade-2701b824f1f0');
INSERT INTO public.bank_accounts (id, bank_name, account_type, account_number, routing_number, verified_at, company_id)
  VALUES ('b5bda5c4-e548-4f38-b1ab-423dca8b8bba', 'Capital One', 'Savings', '345345345', '123123123', NULL, '57ee8797-1d5b-4a90-83c9-84c740590e42');

INSERT INTO public.company_vendor_partnerships (id, company_id, vendor_id, vendor_agreement_id, vendor_bank_id, vendor_license_id, created_at, updated_at)
  VALUES ('601f0400-a27e-42e1-b67c-2c856ce1ab41', '57ee8797-1d5b-4a90-83c9-84c740590e42', '6c5e8e17-b807-4488-9e79-832106c36055', NULL, '98971121-c132-4fc3-a921-5ae47ae5bb9f', NULL, '2020-12-15 04:49:03.341418+00', '2020-12-15 04:50:28.051649+00');
INSERT INTO public.company_vendor_partnerships (id, company_id, vendor_id, vendor_agreement_id, vendor_bank_id, vendor_license_id, created_at, updated_at)
  VALUES ('3dc476d9-d281-44c8-b9b1-b37350a57877', '57ee8797-1d5b-4a90-83c9-84c740590e42', '84b3cdd9-6764-43e6-bade-2701b824f1f0', NULL, 'ac62427f-d3fe-4fba-8fb2-9624d22dc070', NULL, '2020-12-15 04:49:46.347155+00', '2020-12-15 04:50:55.849124+00');

COMMIT;
