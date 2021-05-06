import datetime
import decimal
from typing import Any, Callable, Dict, List, Optional, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models, models_util
from bespoke.db.db_constants import (LoanStatusEnum, PaymentMethodEnum,
                                     PaymentStatusEnum, ProductType)
from bespoke.db.models import session_scope
from bespoke.finance import contract_util, financial_summary_util, number_util
from bespoke.finance.payments import payment_util
from bespoke.finance.payments.payment_util import RepaymentOption
from bespoke.finance.types import finance_types, per_customer_types
from dateutil import parser
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

ScheduleRepayFeeReqDict = TypedDict('ScheduleRepayFeeReqDict', {
	'company_id': str,
	'payment_id': str,
	'amount': float,
	'payment_date': str
})

SettleRepayFeeReqDict = TypedDict('SettleRepayFeeReqDict', {
	'company_id': str,
	'payment_id': str,
	'amount': float,
	'deposit_date': str, # When the payment was deposited into the bank
	'settlement_date': str, # Effective date of all the transactions as well
	'items_covered': payment_util.PaymentItemsCoveredDict
})

SettleRepayFeeWithAccountCreditReqDict = TypedDict('SettleRepayFeeWithAccountCreditReqDict', {
	'company_id': str,
	'payment_id': str,
	'amount': float,
	'effective_date': str
})

def create_and_add_repayment_of_account_fee(
	amount: float,
	payment_id: str,
	created_by_user_id: str,
	effective_date: datetime.date,
	session: Session,
) -> models.Transaction:
	t = models.Transaction()
	t.type = db_constants.PaymentType.REPAYMENT_OF_ACCOUNT_FEE
	t.amount = decimal.Decimal(amount)
	t.to_principal = decimal.Decimal(0.0)
	t.to_interest = decimal.Decimal(0.0)
	t.to_fees = decimal.Decimal(0.0)
	t.payment_id = payment_id
	t.created_by_user_id = created_by_user_id
	t.effective_date = effective_date
	session.add(t)
	return t

def create_and_add_repayment_of_account_fee_with_user_credit(
	amount: float,
	payment_id: str,
	created_by_user_id: str,
	effective_date: datetime.date,
	session: Session,
) -> models.Transaction:
	t = models.Transaction()
	t.type = db_constants.PaymentType.USER_CREDIT_TO_ACCOUNT_FEE
	t.amount = decimal.Decimal(amount)
	t.to_principal = decimal.Decimal(0.0)
	t.to_interest = decimal.Decimal(0.0)
	t.to_fees = decimal.Decimal(0.0)
	t.payment_id = payment_id
	t.created_by_user_id = created_by_user_id
	t.effective_date = effective_date
	session.add(t)
	return t

def create_and_add_account_level_fee_repayment(
	company_id: str,
	payment_input: payment_util.RepaymentPaymentInputDict,
	created_by_user_id: str,
	session: Session
) -> Tuple[str, errors.Error]:

	if payment_input['payment_method'] == db_constants.PaymentMethodEnum.REVERSE_DRAFT_ACH:
		return None, errors.Error('Reverse Draft ACH not supported as a payment type for fee repayment yet')

	payment = payment_util.create_repayment_payment(
		company_id=company_id,
		payment_type=db_constants.PaymentType.REPAYMENT_OF_ACCOUNT_FEE,
		payment_input=payment_input,
		created_by_user_id=created_by_user_id
	)
	payment.payment_date = payment_input['requested_payment_date']
	session.add(payment)
	session.flush()
	payment_id = str(payment.id)

	return payment_id, None

def create_and_add_account_level_fee_repayment_with_account_credit(
	company_id: str,
	payment_input: payment_util.RepaymentPaymentInputDict,
	created_by_user_id: str,
	session: Session
) -> Tuple[str, errors.Error]:

	payment_method = payment_input['payment_method']

	if payment_method == PaymentMethodEnum.REVERSE_DRAFT_ACH and not payment_input['company_bank_account_id']:
		raise errors.Error('Bank account to trigger reverse from must be specified if payment method is Reverse Draft ACH', details={})

	payment_input['payment_date'] = payment_input['requested_payment_date'] if payment_method != PaymentMethodEnum.REVERSE_DRAFT_ACH else None

	payment = payment_util.create_repayment_payment(
		company_id=company_id,
		payment_type=db_constants.PaymentType.USER_CREDIT_TO_ACCOUNT_FEE,
		payment_input=payment_input,
		created_by_user_id=created_by_user_id
	)
	session.add(payment)
	session.flush()
	payment_id = str(payment.id)

	return payment_id, None

@errors.return_error_tuple
def schedule_repayment_of_fee(
	req: ScheduleRepayFeeReqDict,
	user_id: str,
	session: Session
) -> Tuple[str, errors.Error]:

	err_details = {
		'method': 'schedule_repayment_of_fee',
		'req': req
	}

	payment_date = date_util.load_date_str(req['payment_date'])
	payment_amount = req['amount']

	if not number_util.is_number(payment_amount) or payment_amount <= 0:
		raise errors.Error('Payment amount must greater than 0', details=err_details)

	if not payment_date:
		raise errors.Error('Payment date must be specified', details=err_details)

	payment = cast(
		models.Payment,
		session.query(models.Payment).filter(
			models.Payment.id == req['payment_id']
		).first())

	if not payment:
		raise errors.Error('No payment found to schedule transaction', details=err_details)

	if not payment.method == PaymentMethodEnum.REVERSE_DRAFT_ACH:
		raise errors.Error('Payment method must be Reverse Draft ACH', details=err_details)

	if payment_amount > payment.requested_amount:
		raise errors.Error('Payment amount cannot be greater than requested payment amount', details=err_details)

	if payment_date < payment.requested_payment_date:
		raise errors.Error('Payment date cannot be before the requested payment date', details=err_details)

	payment.amount = decimal.Decimal(payment_amount)
	payment.payment_date = payment_date

	return str(payment.id), None


@errors.return_error_tuple
def settle_repayment_of_fee_with_account_credit(
	req: SettleRepayFeeWithAccountCreditReqDict,
	user_id: str,
	session: Session
) -> Tuple[List[str], errors.Error]:

	err_details = {
		'method': 'settle_repayment_of_fee_with_account_credit',
		'req': req
	}

	company_id = req['company_id']
	payment_id = req['payment_id']

	payment_amount = req['amount']
	effective_date = date_util.load_date_str(req['effective_date'])

	if not number_util.is_currency_rounded(payment_amount):
		raise errors.Error('Amount specified is not rounded to the penny')

	if not effective_date:
		raise errors.Error('effective_date must be specified')

	payment = cast(
		models.Payment,
		session.query(models.Payment).filter(
			models.Payment.id == payment_id
		).first())

	if not payment:
		raise errors.Error('No payment found to settle transaction', details=err_details)

	if payment.settled_at:
		raise errors.Error('Cannot use this payment because it has already been settled and applied to the users account', details=err_details)

	if payment.type != db_constants.PaymentType.USER_CREDIT_TO_ACCOUNT_FEE:
		raise errors.Error('Can only apply user credits to account fees using this method', details=err_details)

	financial_summary = financial_summary_util.get_latest_financial_summary(
		company_id=company_id, session=session
	)
	if not financial_summary:
		raise errors.Error('No financial summary found for the customer')

	account_balance_dict = cast(finance_types.AccountBalanceDict, financial_summary.account_level_balance_payload)

	if payment_amount > account_balance_dict['fees_total']:
		overpayment_amount = payment_amount - account_balance_dict['fees_total']
		raise errors.Error('Cannot repay ${} worth of fees because the total due by the customer is ${}. Please reduce the amount paid by ${}'.format(
			payment_amount, account_balance_dict['fees_total'], overpayment_amount))

	if payment_amount > account_balance_dict['credits_total']:
		overpayment_amount = payment_amount - account_balance_dict['credits_total']
		raise errors.Error('Cannot repay ${} worth of fees because the total credits available to the customer is ${}. Please reduce the amount paid by ${}'.format(
			payment_amount, account_balance_dict['credits_total'], overpayment_amount))

	# Create the repayment of account fee transaction
	t = create_and_add_repayment_of_account_fee_with_user_credit(
		amount=payment_amount,
		payment_id=payment_id,
		created_by_user_id=user_id,
		effective_date=effective_date,
		session=session,
	)

	repayment_identifier = payment_util.get_and_increment_repayment_identifier(company_id, session)

	payment_util.make_repayment_payment_settled(
		payment,
		settlement_identifier=repayment_identifier,
		amount=decimal.Decimal(payment_amount),
		deposit_date=effective_date,
		settlement_date=effective_date,
		settled_by_user_id=user_id,
	)
	payment.payment_date = effective_date
	session.flush()
	transaction_id = str(t.id)
	tx_ids = []
	tx_ids.append(transaction_id)

	return tx_ids, None

@errors.return_error_tuple
def settle_repayment_of_fee(
	req: SettleRepayFeeReqDict,
	user_id: str,
	session: Session
) -> Tuple[List[str], errors.Error]:

	err_details = {
		'method': 'settle_repayment_of_fee',
		'req': req
	}

	company_id = req['company_id']
	payment_id = req['payment_id']

	payment_amount = req['amount']
	deposit_date = date_util.load_date_str(req['deposit_date'])
	settlement_date = date_util.load_date_str(req['settlement_date'])
	items_covered = req['items_covered']

	if not payment_amount:
		raise errors.Error('Amount must be specified')

	if not number_util.is_currency_rounded(payment_amount):
		raise errors.Error('Amount specified is not rounded to the penny')

	if not deposit_date:
		raise errors.Error('deposit_date must be specified')

	if not settlement_date:
		raise errors.Error('settlement_date must be specified')

	if 'to_user_credit' not in items_covered:
		raise errors.Error('items_covered.to_user_credit must be specified', details=err_details)

	to_user_credit = items_covered['to_user_credit']
	to_fees = items_covered['to_fees']

	if to_user_credit is None or to_fees is None:
		print(req)
		raise errors.Error('To user credit and to fees must be numbers', details=err_details)

	if not number_util.is_currency_rounded(to_user_credit):
		raise errors.Error('To user credit specified is not rounded to the penny')

	if not number_util.is_currency_rounded(to_fees):
		raise errors.Error('To fees specified is not rounded to the penny')


	payment = cast(
		models.Payment,
		session.query(models.Payment).filter(
			models.Payment.id == payment_id
		).first())

	if not payment:
		raise errors.Error('No payment found to settle transaction', details=err_details)

	if payment.settled_at:
		raise errors.Error('Cannot use this payment because it has already been settled and applied to the users account', details=err_details)

	if payment.type != db_constants.PaymentType.REPAYMENT_OF_ACCOUNT_FEE:
		raise errors.Error('Can only apply repayments against account fees using this method', details=err_details)

	if not payment.payment_date:
		raise errors.Error('Payment must have a payment date')

	if deposit_date < payment.payment_date:
		raise errors.Error('Deposit date cannot be before the user specified payment date', details=err_details)

	financial_summary = financial_summary_util.get_latest_financial_summary(
		company_id=company_id, session=session
	)
	if not financial_summary:
		raise errors.Error('No financial summary found for the customer')

	if not number_util.float_eq(req['amount'], to_fees + to_user_credit):
		raise errors.Error('Payment amount of ${} does not equal ${} + ${} (to_fees + to_user_credit)'.format(
			req['amount'], to_fees, to_user_credit))

	account_balance_dict = cast(finance_types.AccountBalanceDict, financial_summary.account_level_balance_payload)
	if to_fees > account_balance_dict['fees_total']:
		overpayment_amount = to_fees - account_balance_dict['fees_total']
		raise errors.Error('Cannot repay ${} worth of fees because the total due by the customer is ${}. Please reduce the amount paid by ${} or credit it back to the user'.format(
			to_fees, account_balance_dict['fees_total'], overpayment_amount))

	tx_ids = []
	if to_user_credit > 0.0:
		credit_tx = payment_util.create_and_add_credit_to_user(
			amount=to_user_credit,
			payment_id=payment_id,
			created_by_user_id=user_id,
			effective_date=settlement_date,
			session=session
		)
		session.flush()
		tx_ids.append(str(credit_tx.id))

	# Create the repayment of account fee transaction
	t = create_and_add_repayment_of_account_fee(
		amount=to_fees,
		payment_id=payment_id,
		created_by_user_id=user_id,
		effective_date=settlement_date,
		session=session,
	)

	repayment_identifier = payment_util.get_and_increment_repayment_identifier(company_id, session)

	payment_util.make_repayment_payment_settled(
		payment,
		settlement_identifier=repayment_identifier,
		amount=decimal.Decimal(req['amount']),
		deposit_date=deposit_date,
		settlement_date=settlement_date,
		settled_by_user_id=user_id,
	)
	session.flush()
	transaction_id = str(t.id)
	tx_ids.append(transaction_id)

	return tx_ids, None
