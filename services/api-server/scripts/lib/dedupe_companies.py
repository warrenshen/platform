import sys
from os import path
from typing import Any, List, cast

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))

from bespoke import errors
from bespoke.db import models
from bespoke.excel import excel_reader


def _check_no_dangling_references(company_id: str, session: Session) -> None:
	payment = cast(
		models.Payment,
		session.query(models.Payment).filter(
			models.Payment.company_id == company_id
		).first())

	if payment:
		raise errors.Error('Company {} has an existing payment, so we cannot delete this company'.format(company_id))

def _delete_company(company_id: str, session: Session) -> None:

	def _delete_db_objects(db_classes: List[Any]):
		for db_class in db_classes:
			db_objects = session.query(db_class).filter(db_class.company_id == company_id).all()
			if not db_objects:
				continue

			for db_object in db_objects:
				session.delete(db_object)

	company = session.query(models.Company).filter(
		models.Company.id == company_id).first()
	company.contract_id = None
	company.company_settings_id = None

	company_settings_list = session.query(models.CompanySettings).filter(
		models.CompanySettings.company_id == company_id).all()
	for company_settings in company_settings_list:
		company_settings.company_id = None

	session.flush()

	pre_db_classes = [
		# models.AuditEvent,
		models.BankAccount,
		models.CompanyAgreement,
		models.CompanyLicense,
		models.EbbaApplication,
		models.File,
		models.FinancialSummary,
		models.Invoice,
		models.LineOfCredit,
		models.Loan,
		models.Payment,
		models.PurchaseOrder,
		models.User,
		models.Contract,
		models.CompanySettings
	]

	_delete_db_objects(pre_db_classes)

	# IMPORTANT
	# The final delete of the company row fails due to a SQL timeout when the audit_events
	# table is searched due to the audits_events.company_id foreign key constraint.
	# session.delete(company)

def dedupe(session: Session, path: str) -> None:

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(path)
	if err:
		raise Exception(err)

	sheet, err = workbook.get_sheet_by_index(0)
	if err:
		raise Exception(err)

	row_tuples = sheet['rows']
	filtered_row_tuples = list(filter(lambda tup: tup[0] is not '', row_tuples[1:]))
	dedupe_tuples(session, filtered_row_tuples)

def dedupe_tuples(session: Session, row_tuples: List[List[str]]):
	print(f'Beginning dedupe...')
	rows_count = len(row_tuples)
	
	for index, row in enumerate(row_tuples):
		print(f'[{index + 1} of {rows_count}]')

		# (replace_company_id, to_delete_company_id, partnership_type)
		replacing_company_id = row[0]
		to_delete_company_id = row[1]
		partnership_type = row[2]

		print(f'[{index + 1} of {rows_count}] Deduping: merge company {to_delete_company_id} into company {replacing_company_id} for partnership type {partnership_type}')

		existing_replacing_company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.id == replacing_company_id
			).first())

		if not existing_replacing_company:
			raise errors.Error('No company found with ID {}'.format(replacing_company_id))

		existing_to_delete_company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.id == to_delete_company_id
			).first())

		if not existing_to_delete_company:
			raise errors.Error('No company found with ID {}'.format(to_delete_company_id))

		_check_no_dangling_references(to_delete_company_id, session)

		if partnership_type == 'vendor':
			# De-dupe operations for vendor case
			# (1) Change purchase_orders.vendor_id
			# (2) Change vendor agreements (and files)
			# (3) Change vendor partnership
			# (3) Change line_of_credits.recipient_vendor_id
			# (4) Transfer bank account of previous vendor

			# 1
			purchase_orders = session.query(models.PurchaseOrder).filter(
				models.PurchaseOrder.vendor_id == to_delete_company_id
			).all()
			for purchase_order in purchase_orders:
				purchase_order.vendor_id = replacing_company_id

			# 2
			company_agreements = session.query(models.CompanyAgreement).filter(
				models.CompanyAgreement.company_id == to_delete_company_id
			).all()
			for company_agreement in company_agreements:
				# Change files.company_id
				company_agreement_file = session.query(models.File).get(company_agreement.file_id)
				company_agreement_file.company_id = replacing_company_id
				# Change company_agreements.company_id
				company_agreement.company_id = replacing_company_id

			# 3
			company_vendor_partnerships = session.query(models.CompanyVendorPartnership).filter(
				models.CompanyVendorPartnership.vendor_id == to_delete_company_id
			).all()
			for partnership in company_vendor_partnerships:
				existing_company_vendor_partnership = session.query(
					models.CompanyVendorPartnership
				).filter_by(
					company_id=partnership.company_id,
					vendor_id=replacing_company_id,
				).first()

				if existing_company_vendor_partnership:
					session.delete(partnership)
				else:
					partnership.vendor_id = replacing_company_id

			# 4
			line_of_credits = session.query(models.LineOfCredit).filter(
				models.LineOfCredit.recipient_vendor_id == to_delete_company_id
			).all()
			for line_of_credit in line_of_credits:
				line_of_credit.recipient_vendor_id = replacing_company_id

			# 5
			bank_accounts = session.query(models.BankAccount).filter(
				models.BankAccount.company_id == to_delete_company_id
			).all()
			for bank_account in bank_accounts:
				bank_account.company_id = replacing_company_id

			if existing_replacing_company.is_vendor != True:
				existing_replacing_company.is_vendor = True

		elif partnership_type == 'payor':
			# De-dupe operations for payor case
			# (1) Change payor agreements (and files)
			# (2) Change payor partnership
			# (3) Change invoices.payor_id

			# 1
			company_agreements = session.query(models.CompanyAgreement).filter(
				models.CompanyAgreement.company_id == to_delete_company_id
			).all()
			for company_agreement in company_agreements:
				# Change files.company_id
				company_agreement_file = session.query(models.File).get(company_agreement.file_id)
				company_agreement_file.company_id = replacing_company_id
				# Change company_agreements.company_id
				company_agreement.company_id = replacing_company_id

			# 2
			company_payor_partnerships = session.query(models.CompanyPayorPartnership).filter(
				models.CompanyPayorPartnership.payor_id == to_delete_company_id
			).all()

			for partnership in company_payor_partnerships:
				existing_company_payor_partnership = session.query(
					models.CompanyPayorPartnership
				).filter_by(
					company_id=partnership.company_id,
					payor_id=replacing_company_id,
				).first()

				if existing_company_payor_partnership:
					session.delete(partnership)
				else:
					partnership.payor_id = replacing_company_id

			# 3
			invoices = session.query(models.Invoice).filter(
				models.Invoice.payor_id == to_delete_company_id
			).all()
			for invoice in invoices:
				invoice.payor_id = replacing_company_id

			if existing_replacing_company.is_payor != True:
				existing_replacing_company.is_payor = True

		else:
			raise errors.Error('Unexpected partnership_type {}'.format(partnership_type))

		# De-dupe operations for both payor / vendor cases
		# 1) Change metrc_transfers.vendor_id
		# 2) Change metrc_deliveries.payor_id
		# 3) Change company_licenses.company_id
		# 4) Change users.company_id
		metrc_transfers = session.query(models.MetrcTransfer).filter(
			models.MetrcTransfer.vendor_id == to_delete_company_id
		).all()
		for metrc_transfer in metrc_transfers:
			metrc_transfer.vendor_id = replacing_company_id

		metrc_deliveries = session.query(models.MetrcDelivery).filter(
			models.MetrcDelivery.payor_id == to_delete_company_id
		).all()
		for metrc_delivery in metrc_deliveries:
			metrc_delivery.payor_id = replacing_company_id

		company_licenses = session.query(models.CompanyLicense).filter(
			models.CompanyLicense.company_id == to_delete_company_id
		).all()
		for company_license in company_licenses:
			company_license.company_id = replacing_company_id

		company_license_file_ids = [company_license.file_id for company_license in company_licenses]
		company_license_files = session.query(models.File).filter(
			models.File.id.in_(company_license_file_ids)
		).all()
		for company_license_file in company_license_files:
			company_license_file.company_id = replacing_company_id

		users = session.query(models.User).filter(
			models.User.company_id == to_delete_company_id
		).all()
		for user in users:
			user.company_id = replacing_company_id

		# Delete everything about the company ID to delete
		_delete_company(to_delete_company_id, session)

		session.flush()

		print(f'[{index + 1} of {rows_count}] Successfully deduped partnership type {partnership_type}')

# Extracts a new vendor company out of an existing company.
# This is useful when you want to undo an erroneous merge.
def extract_vendor_from_company(
	session: Session,
	company_info_tuple: List[List[str]],
	is_test_run: bool = True,
) -> None:
	if is_test_run:
		print('Running in DRY RUN MODE...')

	(
		original_company_identifier,
		new_company_name,
		new_company_dba_name,
		vendor_partner_name, # Name of vendor partner (customer) to be extracted
		user_email, # Email of user to be extracted
		purchase_order_numbers, # List of purchase numbers to move to new vendor
	) = company_info_tuple

	original_company = session.query(models.Company).filter(
		models.Company.identifier == original_company_identifier
	).first()

	if original_company:
		print(f'Found vendor company {original_company.name}')
	else:
		raise errors.Error(f'No company found with identifier {original_company_identifier}')

	if not is_test_run:
		company_settings = models.CompanySettings()
		session.add(company_settings)
		session.flush()
		company_settings_id = str(company_settings.id)

		new_company = models.Company(
			company_settings_id=company_settings_id,
			is_customer=False,
			is_payor=False,
			is_vendor=True,
			name=new_company_name,
			dba_name=new_company_dba_name,
		)
		session.add(new_company)
		session.flush()

	print(f'Created new vendor company {new_company_name}')

	# Customer company who is partnered with new vendor.
	vendor_partner = session.query(models.Company).filter(
		models.Company.name == vendor_partner_name
	).filter(
		models.Company.is_customer.is_(True)
	).first()

	if vendor_partner:
		print(f'Found vendor partner (customer) {vendor_partner.name}')
	else:
		raise errors.Error(f'No company found with name {vendor_partner_name}')

	# 1. Transfer vendor_partnerships
	company_vendor_partnership = session.query(models.CompanyVendorPartnership).filter(
		models.CompanyVendorPartnership.vendor_id == original_company.id
	).filter(
		models.CompanyVendorPartnership.company_id == vendor_partner.id
	).first()

	if company_vendor_partnership:
		print(f'Found company vendor partnership between {original_company.name} (vendor) and {vendor_partner.name} (customer), changing vendor of partnership to {new_company_name}...')
	else:
		raise errors.Error(f'No company vendor partnership found between {original_company.name} and {vendor_partner.name}')

	if not is_test_run:
		company_vendor_partnership.vendor_id = new_company.id

	# 2. Transfer users
	user = session.query(models.User).filter(
		models.User.email == user_email.lower()
	).first()

	if user:
		print(f'Found user with email {user.email}, transferring to {new_company_name}')
	else:
		raise errors.Error(f'No found with email {user_email}')

	if not is_test_run:
		user.company_id = new_company.id

	# 3. Transfer purchase orders
	for purchase_order_number in purchase_order_numbers:
		purchase_order = session.query(models.PurchaseOrder).filter(
			models.PurchaseOrder.company_id == vendor_partner.id
		).filter(
			models.PurchaseOrder.order_number == purchase_order_number
		).first()

		if purchase_order:
			print(f'Found purchase order for {vendor_partner.name} (with vendor {original_company.name}) with {purchase_order.order_number}, changing vendor to {new_company_name}')
		else:
			raise errors.Error(f'No purchase order found for {vendor_partner.name} (with vendor {original_company.name}) with {purchase_order_number}')

		if not is_test_run:
			purchase_order.vendor_id = new_company.id

	print('DONE!')
