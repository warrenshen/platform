"""
	Utility functions for helping to calculate and create the effect of advances
"""

import datetime
import decimal
import logging
import string
from datetime import timedelta
from typing import Callable, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.finance import contract_util, number_util
from bespoke.finance.loans import sibling_util
from bespoke.finance.payments import payment_util
from bespoke.finance.types import per_customer_types
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

ASCII_CHARACTERS = list(string.ascii_uppercase)

FundLoansReqDict = TypedDict('FundLoansReqDict', {
	'loan_ids': List[str],
	'payment': payment_util.PaymentInsertInputDict,
	'should_charge_wire_fee': bool
})

FundLoansRespDict = TypedDict('FundLoansRespDict', {
	'payment_id': str, # payment ID for the advance
	'status': str
})

ARTIFACT_MODEL_INDEX = {
	db_constants.LoanTypeEnum.INVENTORY: models.PurchaseOrder,
	db_constants.LoanTypeEnum.INVOICE: models.Invoice,
}

@errors.return_error_tuple
def fund_loans_with_advance(
	req: FundLoansReqDict,
	bank_admin_user_id: str,
	session_maker: Callable,
) -> Tuple[FundLoansRespDict, errors.Error]:

	payment_input = req['payment']
	loan_ids = req['loan_ids']

	if len(loan_ids) > len(ASCII_CHARACTERS):
		raise errors.Error(f'Cannot create an advance on greater than {len(ASCII_CHARACTERS)} loans at the same time, please remove some loans')

	artifact_ids_index: Dict[str, set] = {
		k: set() for k in ARTIFACT_MODEL_INDEX
	}

	err_details = {
		'payment_input': payment_input,
		'loan_ids': loan_ids,
		'method': 'fund_loans_with_advance'
	}

	advance_amount = payment_input['amount']
	payment_method = payment_input['method']
	should_charge_wire_fee = req['should_charge_wire_fee']

	if payment_method != db_constants.PaymentMethodEnum.WIRE and should_charge_wire_fee is True:
		raise errors.Error('Cannot charge wire fee if payment method is not Wire', details=err_details)

	payment_date = date_util.load_date_str(payment_input['payment_date'])
	settlement_date = date_util.load_date_str(payment_input['settlement_date'])

	payment_dict: models.PaymentDict = None

	with session_scope(session_maker) as session:
		# Note we order loans by [amount, created_at]. This order by
		# impacts which disbursement identifiers are assigned to which loans.
		loans = cast(
			List[models.Loan],
			session.query(models.Loan).filter(
				models.Loan.id.in_(loan_ids)
			).order_by(
				models.Loan.amount.asc(),
				models.Loan.created_at.asc()
			).all())

		if not loans:
			raise errors.Error('No loans found', details=err_details)

		if len(loans) != len(loan_ids):
			raise errors.Error('Not all loans were found to fund in database', details=err_details)

		already_funded_loan_ids: List[str] = []
		already_set_dates_loan_ids: List[str] = []
		not_approved_loan_ids: List[str] = []
		for loan in loans:
			loan_id = str(loan.id)
			if loan.funded_at:
				already_funded_loan_ids.append(loan_id)

			if loan.origination_date or loan.maturity_date or loan.adjusted_maturity_date:
				already_set_dates_loan_ids.append(loan_id)

			if not loan.approved_at:
				not_approved_loan_ids.append(loan_id)

		if not_approved_loan_ids:
			raise errors.Error('These loans are not approved yet. Please remove them from the advances process: {}'.format(
				not_approved_loan_ids), details=err_details)

		if already_funded_loan_ids:
			raise errors.Error('These loans have already been funded. Please remove them from the advances process: {}'.format(
				already_funded_loan_ids), details=err_details)

		if already_set_dates_loan_ids:
			raise errors.Error('These loans either have their origination, maturity, or adjusted maturity date set. Please remove them from the advances process: {}'.format(
				already_set_dates_loan_ids), details=err_details)

		loans_sum = sum([float(loan.amount) for loan in loans])

		if not number_util.float_eq(loans_sum, advance_amount):
			# NOTE: Only support exact amounts for now, where this advance
			# covers exactly all the amounts of the loans listed.
			raise errors.Error('Advance amount must be equal to the sum of loans to fund. Advance amount: {}, sum of loans: {}'.format(
				number_util.to_dollar_format(advance_amount),
				number_util.to_dollar_format(loans_sum)), details=err_details)

		# Group loans by company_id and create an advance per company_id
		company_id_to_loans: Dict[str, List[models.Loan]] = {}
		for loan in loans:
			company_id = str(loan.company_id)
			if company_id not in company_id_to_loans:
				company_id_to_loans[company_id] = []

			company_id_to_loans[company_id].append(loan)

		# Load up the contracts for all the companies listed here
		unique_company_ids = list(company_id_to_loans.keys())
		contracts_by_company_id, err = contract_util.get_active_contracts_by_company_id(
			unique_company_ids, session, err_details)
		if err:
			raise err

		for company_id, loans_for_company in company_id_to_loans.items():
			company = cast(
				models.Company,
				session.query(models.Company).get(company_id))

			amount_to_company = sum([float(loan.amount) for loan in loans_for_company])
			payment = payment_util.create_payment(
				company_id,
				payment_util.PaymentInputDict(
					type=db_constants.PaymentType.ADVANCE,
					amount=amount_to_company,
					payment_method=payment_method,
				),
				user_id=bank_admin_user_id
			)
			payment_util.make_advance_payment_settled(
				payment,
				amount=decimal.Decimal(amount_to_company),
				payment_date=payment_date,
				settlement_date=settlement_date,
				settled_by_user_id=bank_admin_user_id,
			)
			session.add(payment)
			session.flush()
			payment_id = payment.id

			# What is the disbursement identifier?
			#
			# Disbursement identifier is a legacy algorithm
			# Bespoke Financial uses to assign identifiers to loans.
			# A loan is assigned a disbursement identifier when it is funded.
			#
			# For a customer C, a loan that is funded by the 5th advance
			# made to customer C is assigned the identifier "5". A loan that
			# is funded by the 6th advance made to customer C is assigned the
			# identifier "6" (and this goes on and on).
			#
			# For a customer C, multiple loans that are funded by the SAME
			# 7th advance to customer C are assigned identifiers "7A", "7B", "7C", etc.

			# Generate a disbursement identifier for this payment for this company.
			company.latest_disbursement_identifier += 1
			disbursement_identifier = str(company.latest_disbursement_identifier)

			for index, loan in enumerate(loans_for_company):
				# Generate a disbursement identifier for this loan
				# (using the disbursement identifier for this payment for this company).
				if len(loans_for_company) > 1:
					loan.disbursement_identifier = disbursement_identifier + ASCII_CHARACTERS[index]
				else:
					loan.disbursement_identifier = disbursement_identifier

				loan_amount = float(loan.amount)

				t = models.Transaction()
				t.type = db_constants.PaymentType.ADVANCE
				t.amount = decimal.Decimal(loan_amount)
				t.to_principal = decimal.Decimal(loan_amount)
				t.to_interest = decimal.Decimal(0.0)
				t.to_fees = decimal.Decimal(0.0)
				t.loan_id = loan.id
				t.payment_id = payment_id
				t.created_by_user_id = bank_admin_user_id
				t.effective_date = settlement_date
				session.add(t)

			if should_charge_wire_fee:
				cur_contract = contracts_by_company_id[company_id]
				cur_wire_fee, err = cur_contract.get_wire_fee()
				if err:
					raise err

				# If wire fee specified in contract is greater than zero,
				# create a wire fee (an account level fee).
				if cur_wire_fee > 0.0:
					t = payment_util.create_and_add_account_level_fee(
						company_id=company_id,
						subtype=db_constants.TransactionSubType.WIRE_FEE,
						amount=cur_wire_fee,
						originating_payment_id=payment_id,
						created_by_user_id=bank_admin_user_id,
						payment_date=payment_date,
						effective_date=settlement_date,
						session=session
					)
					session.add(t)

		for loan in loans:
			cur_contract = contracts_by_company_id[str(loan.company_id)]
			maturity_date, err = cur_contract.get_maturity_date(settlement_date)
			if err:
				raise err

			adjusted_maturity_date, err = cur_contract.get_adjusted_maturity_date(settlement_date)
			if err:
				raise err

			loan.funded_at = date_util.now()
			loan.funded_by_user_id = bank_admin_user_id
			loan.outstanding_principal_balance = loan.amount
			loan.outstanding_interest = decimal.Decimal(0.0)
			loan.outstanding_fees = decimal.Decimal(0.0)
			loan.origination_date = settlement_date
			loan.maturity_date = maturity_date
			loan.adjusted_maturity_date = adjusted_maturity_date

			if loan.loan_type in artifact_ids_index:
				artifact_ids_index[loan.loan_type].add(loan.artifact_id)

	# Once all of those writes are complete, we check if any of the associated
	# artifacts are fully funded and mark them so
	with session_scope(session_maker) as session:
		for loan_type, ids in artifact_ids_index.items():
			Model = ARTIFACT_MODEL_INDEX[loan_type]
			for id_ in ids:
				artifact = session.query(Model).get(id_)

				if not artifact:
					logging.warning(f"Failed to find artifact with id {id_} of for loan with {loan_type}")
					continue # Early Continuation

				funded_amount = sibling_util.get_funded_loan_sum_on_artifact(
					session,
					id_)

				if funded_amount >= artifact.max_loan_amount():
					artifact.funded_at = date_util.now()

	return FundLoansRespDict(
		payment_id=str(payment_id),
		status='OK'
	), None

DeleteAdvanceReqDict = TypedDict('DeleteAdvanceReqDict', {
	'payment_id': str
})

@errors.return_error_tuple
def delete_advance(
	req: DeleteAdvanceReqDict,
	user_id: str,
	session_maker: Callable
) -> Tuple[bool, errors.Error]:

	with session_scope(session_maker) as session:
		payment_id = req['payment_id']
		success, err = payment_util.unsettle_payment(
			payment_type=db_constants.PaymentType.ADVANCE,
			payment_id=payment_id,
			session=session
		)
		if err:
			raise err

		success, err = payment_util.delete_payment(
				payment_type=db_constants.PaymentType.ADVANCE,
				payment_id=payment_id,
				session=session
			)
		if err:
			raise err

		transaction = cast(
			models.Transaction,
			session.query(models.Transaction).filter(
				models.Transaction.payment_id == payment_id
			).first())
		if not transaction:
			raise errors.Error('No settled payment found to delete')

		if not transaction.loan_id:
			raise errors.Error('No loan id associated with the settled payment')

		loan = cast(
			models.Loan,
			session.query(models.Loan).filter(
				models.Loan.id == transaction.loan_id).first())

		if not loan:
			raise errors.Error('Could not find loan associated with the payment being deleted')

		loan.origination_date = None
		loan.maturity_date = None
		loan.adjusted_maturity_date = None
		loan.funded_at = None
		loan.funded_by_user_id = None

	return True, None
