import decimal
import sys
from datetime import datetime, time
from os import path
from typing import cast

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import PaymentMethodEnum, PaymentType
from bespoke.excel import excel_reader
from bespoke.finance import number_util
from bespoke.finance.types import payment_types


def import_settled_advances(
	session: Session,
	advance_tuples,
) -> None:
	"""
	Imports advances for all product types.
	"""
	advances_count = len(advance_tuples)
	print(f'Running for {advances_count} advances...')

	for index, new_advance_tuple in enumerate(advance_tuples):
		print(f'[{index + 1} of {advances_count}]')
		(
			customer_identifier,
			loan_identifier,
			payment_type,
			amount,
			payment_date,
			deposit_date,
			settlement_date,
		) = new_advance_tuple

		parsed_customer_identifier = customer_identifier.strip()
		parsed_amount = number_util.round_currency(float(amount))
		parsed_payment_date = date_util.load_date_str(payment_date) if payment_date else None
		parsed_deposit_date = date_util.load_date_str(deposit_date)
		parsed_settlement_date = date_util.load_date_str(settlement_date)

		if not parsed_payment_date:
			parsed_payment_date = parsed_deposit_date

		parsed_submitted_at = datetime.combine(parsed_payment_date, time())
		parsed_settled_at = datetime.combine(parsed_settlement_date, time())

		try:
			# If loan_identifier from XLSX is "25.0", convert it to 25.
			numeric_loan_identifier = int(float(loan_identifier))
			parsed_loan_identifier = str(numeric_loan_identifier)
		except Exception:
			# If loan_identifier is "PB", leave it as is.
			# This is a special identifier signifying "Previous Balance".
			if loan_identifier.strip() == "PB":
				numeric_loan_identifier = 0
				parsed_loan_identifier = "PB"
			else:
				# If loan_identifier from XLSX is "25A", convert it to 25.
				numeric_loan_identifier = int("".join(filter(str.isdigit, loan_identifier)))
				parsed_loan_identifier = loan_identifier

		if (
			not parsed_customer_identifier or
			not parsed_loan_identifier or
			not parsed_amount or
			parsed_amount <= 0 or
			not parsed_payment_date or
			not parsed_deposit_date or
			not parsed_settlement_date
		):
			print(f'[{index + 1} of {advances_count}] Invalid advance field(s)')
			print(f'EXITING EARLY')
			return

		numeric_payment_disbursement_identifier = numeric_loan_identifier

		customer = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.is_customer.is_(True)
			).filter(
				models.Company.identifier == parsed_customer_identifier
			).first())

		if not customer:
			print(f'[{index + 1} of {advances_count}] Customer with identifier {parsed_customer_identifier} does not exist')
			print(f'EXITING EARLY')
			return

		loan = cast(
			models.Loan,
			session.query(models.Loan).filter(
				models.Loan.company_id == customer.id,
			).filter(
				models.Loan.identifier == parsed_loan_identifier
			).first())

		if not loan:
			print(f'[{index + 1} of {advances_count}] Loan with identifier {parsed_loan_identifier} does not exist')
			print(f'EXITING EARLY')
			return

		if not number_util.float_eq(loan.amount, parsed_amount):
			print(f'[{index + 1} of {advances_count}] Loan with identifer {parsed_loan_identifier} but incorrect amount exists')
			print(f'EXITING EARLY')
			return

		if loan.origination_date != parsed_settlement_date:
			print(f'[{index + 1} of {advances_count}] Loan with identifer {parsed_loan_identifier} but incorrect origination date exists')
			print(f'EXITING EARLY')
			return

		parsed_payment_type = None
		if payment_type == 'advance':
			parsed_payment_type = PaymentType.ADVANCE

		if parsed_payment_type != PaymentType.ADVANCE:
			print(f'[{index + 1} of {advances_count}] Invalid advance field(s)')
			print(f'EXITING EARLY')
			return

		existing_advance = cast(
			models.Payment,
			session.query(models.Payment).filter(
				models.Payment.company_id == customer.id
			).filter(
				models.Payment.type == PaymentType.ADVANCE
			).filter(
				models.Payment.amount == parsed_amount
			).filter(
				models.Payment.settlement_date == parsed_settlement_date
			).first())

		existing_transaction = cast(
			models.Transaction,
			session.query(models.Transaction).filter(
				models.Transaction.loan_id == loan.id
			).filter(
				models.Transaction.type == PaymentType.ADVANCE
			).filter(
				models.Transaction.amount == parsed_amount
			).filter(
				models.Transaction.effective_date == parsed_settlement_date
			).first())

		# Note: we check for BOTH an existing advance and
		# existing transaction because there may be two advances
		# with the same amount with the same settlement date,
		# but on two different loans (of the same amount).
		if existing_advance and existing_transaction:
			print(f'[{index + 1} of {advances_count}] Advance on loan {parsed_loan_identifier} with settlement date {settlement_date} already exists')
			continue

		print(f'[{index + 1} of {advances_count}] Advance on loan {parsed_loan_identifier} for {customer.name} ({customer.identifier}) does not exist, creating it...')

		advance = models.Payment(
			company_id=customer.id,
			settlement_identifier=str(numeric_payment_disbursement_identifier),
			type=PaymentType.ADVANCE,
			method=PaymentMethodEnum.UNKNOWN,
			amount=parsed_amount,
			payment_date=parsed_payment_date,
			deposit_date=parsed_deposit_date,
			settlement_date=parsed_settlement_date,
			submitted_at=parsed_submitted_at,
			settled_at=parsed_settled_at,
		)
		session.add(advance)
		session.flush()

		transaction = models.Transaction(
			payment_id=advance.id,
			loan_id=loan.id,
			type=PaymentType.ADVANCE,
			subtype=None,
			amount=parsed_amount,
			to_principal=decimal.Decimal(parsed_amount),
			to_interest=decimal.Decimal(0.0),
			to_fees=decimal.Decimal(0.0),
			effective_date=parsed_settlement_date,
		)
		session.add(transaction)
		session.flush()

		print(f'[{index + 1} of {advances_count}] Created advance on loan {parsed_loan_identifier} for {customer.name} ({customer.identifier})')

		# If loan_identifier is "PB", we perform special hard-coded logic.
		if parsed_loan_identifier == 'PB':
			if parsed_customer_identifier == '5MIL':
				payment_util.create_and_add_adjustment(
					company_id=str(customer.id),
					loan_id=str(loan.id),
					tx_amount_dict=payment_types.TransactionAmountDict(
						to_principal=0.0,
						to_interest=48870.15,
						to_fees=0.0,
					),
					created_by_user_id=None,
					deposit_date=parsed_deposit_date,
					effective_date=parsed_settlement_date,
					session=session,
				)
			elif parsed_customer_identifier == 'DF':
				payment_util.create_and_add_adjustment(
					company_id=str(customer.id),
					loan_id=str(loan.id),
					tx_amount_dict=payment_types.TransactionAmountDict(
						to_principal=0.0,
						to_interest=187982.54,
						to_fees=0.0,
					),
					created_by_user_id=None,
					deposit_date=parsed_deposit_date,
					effective_date=parsed_settlement_date,
					session=session,
				)
			else:
				print(f'[{index + 1} of {advances_count}] Invalid advance field(s): PB but not in whitelist')
				print(f'EXITING EARLY')
				return
		else:
			customer_latest_disbursement_identifier = customer.latest_disbursement_identifier
			new_latest_disbursement_identifier = max(numeric_payment_disbursement_identifier, customer_latest_disbursement_identifier)
			customer.latest_disbursement_identifier = new_latest_disbursement_identifier

			print(f'Customer {customer.name} latest_disbursement_identifier is now "{new_latest_disbursement_identifier}"')
			session.flush()

def load_into_db_from_excel(session: Session, path: str) -> None:
	print(f'Beginning import...')

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(path)
	if err:
		raise Exception(err)

	sheet, err = workbook.get_sheet_by_index(0)
	if err:
		raise Exception(err)

	advance_tuples = sheet['rows']
	# Skip the header row and filter out empty rows.
	filtered_advance_tuples = list(filter(lambda advance_tuple: advance_tuple[0] is not '', advance_tuples[1:]))
	import_settled_advances(session, filtered_advance_tuples)
	print(f'Finished import')
