"""
	Utility functions for helping to calculate and create the effect of advances
"""

import datetime
import decimal
from typing import Callable, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.finance import number_util
from bespoke.finance.payments import payment_util
from bespoke.finance.types import per_customer_types
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

FundLoansRespDict = TypedDict('FundLoansRespDict', {
	'status': str
})

def fund_loans_with_advance(
	bank_admin_user_id: str,
	loan_ids: List[str], payment_input: payment_util.PaymentInsertInputDict,
	session_maker: Callable) -> Tuple[FundLoansRespDict, errors.Error]:

	err_details = {
		'payment_input': payment_input,
		'loan_ids': loan_ids,
		'method': 'fund_loans_with_advance'
	}
	loan_dicts = []
	payment_dict: models.PaymentDict = None

	with session_scope(session_maker) as session:
		loans = cast(
			List[models.Loan],
			session.query(models.Loan).filter(
				models.Loan.id.in_(loan_ids)
			).all())
		if not loans:
			return None, errors.Error('No loans found', details=err_details)

		if len(loans) != len(loan_ids):
			return None, errors.Error('Not all loans were found to fund in database', details=err_details)

		already_funded_loan_ids: List[str] = []
		not_approved_loan_ids: List[str] = []
		for loan in loans:
			loan_id = str(loan.id)
			if loan.funded_at:
				already_funded_loan_ids.append(loan_id)
			if not loan.approved_at:
				not_approved_loan_ids.append(loan_id)

			loan_dicts.append(loan.as_dict())

		if not_approved_loan_ids:
			return None, errors.Error('These loans are not approved yet. Please remove them from the advances process: {}'.format(
				not_approved_loan_ids), details=err_details)

		if already_funded_loan_ids:
			return None, errors.Error('These loans have already been funded. Please remove them from the advances process: {}'.format(
				already_funded_loan_ids), details=err_details)

		loans_sum = 0.0
		for loan_dict in loan_dicts:
			loans_sum += float(loan_dict['amount'])

		advance_amount = payment_input['amount']

		if not number_util.float_eq(loans_sum, advance_amount):
			# NOTE: Only support exact amounts for now, where this advance covers exactly all
			# the amounts of the loans listed.
			return None, errors.Error('Advance amount must the sum of loans to fund exactly. Advance amount: {}, sum of loans: {}'.format(
				number_util.to_dollar_format(advance_amount),
				number_util.to_dollar_format(loans_sum)), details=err_details)

		# Group loans by company_id and create an advance per company_id
		company_id_to_loans: Dict[str, List[models.LoanDict]] = {}
		for loan_dict in loan_dicts:
			company_id = loan_dict['company_id']
			if company_id not in company_id_to_loans:
				company_id_to_loans[company_id] = []

			company_id_to_loans[company_id].append(loan_dict)

		for company_id, loans_for_company in company_id_to_loans.items():
			amount_to_company = sum([cur_loan_dict['amount'] for cur_loan_dict in loans_for_company])
			payment = payment_util.create_payment(company_id, payment_util.PaymentInputDict(
				type=db_constants.PaymentType.ADVANCE,
				amount=amount_to_company,
				payment_method=payment_input['method']
			))
			payment.applied_at = date_util.now()
			payment.applied_by_user_id = bank_admin_user_id
			payment.deposit_date = date_util.today_as_date()
			payment.submitted_by_user_id = bank_admin_user_id
			session.add(payment)
			session.flush()
			payment_id = payment.id

			for loan_dict in loans_for_company:
				amount = loan_dict['amount']
				t = models.Transaction()
				t.type = db_constants.PaymentType.ADVANCE
				t.amount = decimal.Decimal(amount)
				t.to_principal = decimal.Decimal(amount)
				t.to_interest = decimal.Decimal(0.0)
				t.to_fees = decimal.Decimal(0.0)
				t.loan_id = loan_dict['id']
				t.payment_id = payment_id
				t.created_by_user_id = bank_admin_user_id
				t.effective_date = date_util.today_as_date()
				session.add(t)

		for loan in loans:
			loan.status = db_constants.LoanStatusEnum.FUNDED
			loan.funded_at = date_util.now()
			loan.funded_by_user_id = bank_admin_user_id
			loan.outstanding_principal_balance = loan.amount
			loan.outstanding_interest = decimal.Decimal(0.0)
			loan.outstanding_fees = decimal.Decimal(0.0)

	return FundLoansRespDict(status='OK'), None

