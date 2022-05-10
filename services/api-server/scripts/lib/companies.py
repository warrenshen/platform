import sys
from os import path
from typing import cast

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), '../src')))

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import CompanyType
from bespoke.excel import excel_reader
from sqlalchemy import or_

def import_payors_vendors(
	session: Session,
	payor_vendor_tuples,
) -> None:
	payors_vendors_count = len(payor_vendor_tuples)
	print(f'Creating {payors_vendors_count} payors / vendors...')

	for index, new_payor_vendor_tuple in enumerate(payor_vendor_tuples):
		(
			customer_identifier,
			customer_name,
			company_type,
			company_contract_name,
			company_name,
			company_dba_1,
			company_dba_2,
		) = new_payor_vendor_tuple

		parsed_customer_identifier = customer_identifier.strip()
		customer_name = customer_name.strip()
		company_name = company_name.strip()

		if (
			not parsed_customer_identifier or
			not customer_name or
			not company_type or
			not company_contract_name or
			not company_name
		):
			print(f'[{index + 1} of {payors_vendors_count}] Invalid row')
			continue

		company_type = company_type.lower()

		if company_type not in [CompanyType.Payor, CompanyType.Vendor]:
			print(f'[{index + 1} of {payors_vendors_count}] Invalid company type')
			continue

		customer = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.is_customer == True
			).filter(
				models.Company.identifier == parsed_customer_identifier
			).first())
		if not customer:
			print(f'[{index + 1} of {payors_vendors_count}] Customer with identifier {parsed_customer_identifier} does not exist')
			continue

		company = None

		existing_company_by_name = cast(
			models.Company,
			session.query(models.Company).filter(
				or_(models.Company.is_vendor == True, models.Company.is_payor == True)
			).filter(
				models.Company.name == company_name
			).first())

		if existing_company_by_name:
			print(f'[{index + 1} of {payors_vendors_count}] Company with name {company_name} already exists')
			company = existing_company_by_name

			if company_type == 'payor' and not company.is_payor:
				company.is_payor = True
			elif company_type == 'vendor' and not company.is_vendor:
				company.is_vendor = True
		else:
			print(f'[{index + 1} of {payors_vendors_count}] Company with name {company_name} does not exist, creating it...')

			company_settings = models.CompanySettings()
			session.add(company_settings)

			session.flush()
			company_settings_id = str(company_settings.id)

			dba_name = None
			if company_dba_1 and company_dba_2:
				dba_name = f'{company_dba_1}, {company_dba_2}'
			elif company_dba_1:
				dba_name = company_dba_1

			company = models.Company(
				company_settings_id=company_settings_id,
				is_customer=company_type == 'customer',
				is_payor=company_type == 'payor',
				is_vendor=company_type == 'vendor',
				name=company_name,
				contract_name=company_contract_name,
				dba_name=dba_name,
			)
			session.add(company)
			session.flush()

			company_id = str(company.id)
			company_settings.company_id = company_id
			session.flush()

			print(f'[{index + 1} of {payors_vendors_count}] Created company {company.name}')

		if company_type == CompanyType.Payor:
			existing_company_payor_partnership = cast(
				models.CompanyPayorPartnership,
				session.query(models.CompanyPayorPartnership).filter(
					models.CompanyPayorPartnership.company_id == customer.id
				).filter(
					models.CompanyPayorPartnership.payor_id == company.id,
				).first())

			if existing_company_payor_partnership:
				print(f'[{index + 1} of {payors_vendors_count}] Company payor partnership between customer {customer_name} and payor {company_name} already exists')
				if not existing_company_payor_partnership.approved_at:
					existing_company_payor_partnership.approved_at = date_util.now()
					print(f'[{index + 1} of {payors_vendors_count}] Company payor partnership between customer {customer_name} and payor {company_name} is not approved, approving it...')
			else:
				print(f'[{index + 1} of {payors_vendors_count}] Company payor partnership between customer {customer_name} and payor {company_name} does not exist, creating it...')
				company_payor_partnership = models.CompanyPayorPartnership(
					company_id=customer.id,
					payor_id=company.id,
					approved_at=date_util.now(),
				)
				session.add(company_payor_partnership)
				print(f'[{index + 1} of {payors_vendors_count}] Created company payor partnership between customer {customer_name} and payor {company_name}')
		else:
			existing_company_vendor_partnership = cast(
				models.CompanyVendorPartnership,
				session.query(models.CompanyVendorPartnership).filter(
					models.CompanyVendorPartnership.company_id == customer.id
				).filter(
					models.CompanyVendorPartnership.vendor_id == company.id,
				).first())

			if existing_company_vendor_partnership:
				print(f'[{index + 1} of {payors_vendors_count}] Company vendor partnership between customer {customer_name} and vendor {company_name} already exists')
				if not existing_company_vendor_partnership.approved_at:
					existing_company_vendor_partnership.approved_at = date_util.now()
					print(f'[{index + 1} of {payors_vendors_count}] Company payor partnership between customer {customer_name} and payor {company_name} is not approved, approving it...')
			else:
				print(f'[{index + 1} of {payors_vendors_count}] Company vendor partnership between customer {customer_name} and vendor {company_name} does not exist, creating it...')
				company_vendor_partnership = models.CompanyVendorPartnership(
					company_id=customer.id,
					vendor_id=company.id,
					approved_at=date_util.now(),
				)
				session.add(company_vendor_partnership)
				print(f'[{index + 1} of {payors_vendors_count}] Created company vendor partnership between customer {customer_name} and vendor {company_name}')

def load_into_db_from_excel(session: Session, path: str) -> None:
	print(f'Beginning import...')

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(path)
	if err:
		raise Exception(err)

	sheet, err = workbook.get_sheet_by_index(0)
	if err:
		raise Exception(err)

	payor_vendor_tuples = sheet['rows']
	# Skip the header row and filter out empty rows.
	filtered_payor_vendor_tuples = list(filter(lambda payor_vendor_tuple: payor_vendor_tuple[0] is not '', payor_vendor_tuples[1:]))
	import_payors_vendors(session, filtered_payor_vendor_tuples)

	print(f'Finished import')

def import_company_licenses(
	session: Session,
	company_license_tuples,
) -> None:
	company_licenses_count = len(company_license_tuples)
	print(f'Importing {company_licenses_count} licenses...')

	for index, company_license_tuple in enumerate(company_license_tuples):
		(
			company_name,
			license_number,
		) = company_license_tuple

		parsed_company_name = company_name.strip()
		parsed_license_number = license_number.strip()

		if (
			not parsed_company_name or
			not parsed_license_number
		):
			print(f'[{index + 1} of {company_licenses_count}] Invalid row')
			continue

		companies = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.name == parsed_company_name
			).all())
		if not companies:
			print(f'[{index + 1} of {company_licenses_count}] Company with name {parsed_company_name} does not exist, skipping...')
			continue

		for company in companies:
			print(f'[{index + 1} of {company_licenses_count}] Creating licenses for company {parsed_company_name} ({str(company.id)})...')
			existing_company_license = cast(
				models.CompanyLicense,
				session.query(models.CompanyLicense).filter_by(
					company_id=company.id,
					license_number=parsed_license_number,
				).first())

			if existing_company_license:
				print(f'[{index + 1} of {company_licenses_count}] Company license {parsed_license_number} for {parsed_company_name} ({str(company.id)}) already exists, skipping...')
				continue

			new_company_license = models.CompanyLicense(
				company_id=company.id,
				license_number=parsed_license_number
			)
			session.add(new_company_license)
			print(f'[{index + 1} of {company_licenses_count}] Created company license {parsed_license_number} for {parsed_company_name} ({str(company.id)})')
