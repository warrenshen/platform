import sys
from os import path
from typing import Any, List, cast

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../src")))

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

	pre_db_classes = [
		models.AuditEvent, models.BankAccount, models.CompanyAgreement,
		models.CompanyLicense, models.EbbaApplication, models.File,
		models.FinancialSummary, models.Invoice, models.LineOfCredit,
		models.Loan, models.Payment, models.PurchaseOrder, models.User,
		models.Contract, models.CompanySettings
	]

	company = session.query(models.Company).filter(
		models.Company.id == company_id).first()
	company.contract_id = None
	company.company_settings_id = None

	company_settings_list = session.query(models.CompanySettings).filter(
		models.CompanySettings.company_id == company_id).all()
	for company_settings in company_settings_list:
		company_settings.company_id = None

	session.flush()

	_delete_db_objects(pre_db_classes)

	session.delete(company)

def dedupe(session: Session, path: str) -> None:

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(path)
	if err:
		raise Exception(err)

	sheet, err = workbook.get_sheet_by_index(0)
	if err:
		raise Exception(err)

	row_tuples = sheet['rows']
	filtered_row_tuples = list(filter(lambda tup: tup[0] is not '', row_tuples[1:]))

	for row in filtered_row_tuples:
		# (replace_company_id, to_delete_company_id, partnership_type)
		replacing_company_id = row[0]
		to_delete_company_id = row[1]
		partnership_type = row[2]

		print('Deduping data from row {}'.format(row))

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
			# (1) Change PurchaseOrder vendor_id
			# (2) Change vendor agreements
			# (3) Change vendor partnership
			# (3) Change LineOfCredit recipient_vendor_id
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
				company_agreement.company_id = replacing_company_id

			# 3
			company_vendor_partnerships = session.query(models.CompanyVendorPartnership).filter(
				models.CompanyVendorPartnership.vendor_id == to_delete_company_id
			).all()
			for partnership in company_vendor_partnerships:
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

		elif partnership_type == 'payor':
			# (1) Change payor agreements
			# (2) Change payor partnership
			# (3) Change Invoice payor_id

			# 1
			company_agreements = session.query(models.CompanyAgreement).filter(
				models.CompanyAgreement.company_id == to_delete_company_id
			).all()
			for company_agreement in company_agreements:
				company_agreement.company_id = replacing_company_id

			# 2
			company_payor_partnerships = session.query(models.CompanyPayorPartnership).filter(
				models.CompanyPayorPartnership.payor_id == to_delete_company_id
			).all()

			for partnership in company_payor_partnerships:
				partnership.payor_id = replacing_company_id

			# 3
			invoices = session.query(models.Invoice).filter(
				models.Invoice.payor_id == to_delete_company_id
			).all()
			for invoice in invoices:
				invoice.payor_id = replacing_company_id

		else:
			raise errors.Error('Unexpected partnership_type {}'.format(partnership_type))

		# Delete everything about the company ID to delete
		_delete_company(to_delete_company_id, session)
