
import datetime
import decimal

from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Tuple, List, Optional, Callable, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models, db_constants
from bespoke.db.models import session_scope
from bespoke.finance.types import per_customer_types
from bespoke.finance import number_util
from bespoke.finance.payments import payment_util

# These inputs are seen by the Bank admin before sending them to the /settle_payment
# handler.
#
# The admin has the ability to modify these values which is why we send it up to them.
#
# These are also the same transactions that get generated by "calculate repayment effect"
# to show the customer and bank admin what the effect of the payment will be.
TransactionInputDict = TypedDict('TransactionInputDict', {
	'amount': float,
	'to_principal': float,
	'to_interest': float,
	'to_fees': float
})

LoanBalanceDict = TypedDict('LoanBalanceDict', {
	'amount': float,
	'outstanding_principal_balance': float,
	'outstanding_interest': float,
	'outstanding_fees': float
})

# Information about a loan after a payment has been applied to it.
LoanAfterwardsDict = TypedDict('LoanAfterwardsDict', {
  'loan_id': str,
  'transaction': TransactionInputDict,
  'loan_balance': LoanBalanceDict  
})

RepaymentEffectRespDict = TypedDict('RepaymentEffectRespDict', {
	'status': str,
	'loans_afterwards': List[LoanAfterwardsDict],
	'amount_to_pay': float
})

SettlePaymentReqDict = TypedDict('SettlePaymentReqDict', {
	'company_id': str, 
	'payment_id': str,
	'loan_ids': List[str],
	'transaction_inputs': List[TransactionInputDict],
	'effective_date': str, # Effective date of all the transactions
	'deposit_date': str # When the payment was deposited into the bank
})

def _zero_if_null(val: Optional[float]) -> float:
	if val is None:
		return 0.0
	return val


def calculate_repayment_effect(
	payment_input: payment_util.PaymentInsertInputDict,
	payment_option: str,
	company_id: str,
	loan_ids: List[str],
	session_maker: Callable) -> Tuple[RepaymentEffectRespDict, errors.Error]:
	# What loans and fees does would this payment pay off?

	if payment_option == 'custom_amount':
		if not number_util.is_number(payment_input.get('amount')) and payment_input['amount'] <= 0:
			return None, errors.Error('Amount must greater than 0 when the payment option is Custom Amount')

	if not payment_input.get('deposit_date'):
		return None, errors.Error('Deposit date must be specified')
	
	if not loan_ids:
		return None, errors.Error('No loan ids are selected')

	# TODO(dlluncor): Handle the case where we change the loans a user tries to pay off
	# because they haven't selected loans that have already come due.

	# Figure out how much is due by a particular date
	loan_dicts = []
	err_details = {'company_id': company_id, 'loan_ids': loan_ids, 'method': 'calculate_repayment_effect'}

	with session_scope(session_maker) as session:		
		loans = cast(
			List[models.Loan],
			session.query(models.Loan).filter(
				models.Loan.company_id == company_id
			).filter(
				models.Loan.id.in_(loan_ids)
			).all())

		if not loans:
			return None, errors.Error('No loans found', details=err_details)

		# Do I use the adjusted_maturity date or maturity_date?
		for loan in loans:
			loan_dicts.append(loan.as_dict())

	date_selected = date_util.load_date_str(payment_input['deposit_date'])

	amount_to_pay = 0.0
	loans_afterwards = []

	def _pay_off_loan_in_full(loan_dict: models.LoanDict) -> float:
		current_payment_amount = payment_util.sum([
			loan_dict['outstanding_principal_balance'],
			loan_dict['outstanding_interest'],
			loan_dict['outstanding_fees']
		])
		loans_afterwards.append(LoanAfterwardsDict(
			loan_id=loan_dict['id'],
			transaction=TransactionInputDict(
				amount=current_payment_amount,
				to_principal=_zero_if_null(loan_dict['outstanding_principal_balance']),
				to_interest=_zero_if_null(loan_dict['outstanding_interest']),
				to_fees=_zero_if_null(loan_dict['outstanding_fees'])
			),
			loan_balance=LoanBalanceDict(
				amount=loan_dict['amount'],
				outstanding_principal_balance=0.0,
				outstanding_interest=0.0,
				outstanding_fees=0.0
			)
		))
		return current_payment_amount

	if payment_option == 'custom_amount':
		amount_to_pay = payment_input['amount']
		# TODO(dlluncor): Generate the correct transactions for a custom amount.

	elif payment_option == 'pay_minimum_due':

		for loan_dict in loan_dicts:

			if loan_dict['adjusted_maturity_date'] > date_selected:
				# You dont have to worry about paying off this loan yet.
				# So the transaction has zero dollars and no effect to it.
				loans_afterwards.append(LoanAfterwardsDict(
					loan_id=loan_dict['id'],
					transaction=TransactionInputDict(
						amount=0.0, to_principal=0.0, to_interest=0.0, to_fees=0.0
					),
					loan_balance=LoanBalanceDict(
						amount=loan_dict['amount'],
						outstanding_principal_balance=_zero_if_null(
							loan_dict['outstanding_principal_balance']),
						outstanding_interest=_zero_if_null(loan_dict['outstanding_interest']),
						outstanding_fees=_zero_if_null(loan_dict['outstanding_fees'])
					)
				))
			else:
				# Pay loans that have come due.
				amount_to_pay += _pay_off_loan_in_full(loan_dict)

	elif payment_option == 'pay_in_full':

		for loan_dict in loan_dicts:
			amount_to_pay += _pay_off_loan_in_full(loan_dict)
	else:
		return None, errors.Error('Unrecognized payment option')

	return RepaymentEffectRespDict(
		status='OK',
		loans_afterwards=loans_afterwards,
		amount_to_pay=amount_to_pay
	), None

def create_payment(
	company_id: str, payment_insert_input: payment_util.PaymentInsertInputDict,
	loan_ids: List[str], user_id: str, session_maker: Callable) -> Tuple[str, errors.Error]:

	payment_id = None

	with session_scope(session_maker) as session:			
		loans = cast(
			List[models.Loan],
			session.query(models.Loan).filter(
				models.Loan.company_id == company_id
			).filter(
				models.Loan.id.in_(loan_ids)
			).all())

		if not loans:
			return None, errors.Error('No loans associated with create payment submission')

		if len(loans) != len(loan_ids):
			return None, errors.Error('Not all loans found in create payment submission')

		not_funded_loan_ids = []
		for loan in loans:
			if not loan.funded_at:
				not_funded_loan_ids.append(loan.id)

		if not_funded_loan_ids:
			return None, errors.Error('Not all loans are funded')

		payment_input = payment_util.PaymentInputDict(
			type=db_constants.PaymentType.REPAYMENT,
			amount=payment_insert_input['amount'],
			payment_method=payment_insert_input['method']
		)
		payment = payment_util.create_payment(
			company_id, payment_input, user_id)
		payment.items_covered = {
			'loan_ids': loan_ids
		}
		session.add(payment)
		session.flush()
		payment_id = str(payment.id)

	return payment_id, None

def settle_payment(
	req: SettlePaymentReqDict, user_id: str, session_maker: Callable) -> Tuple[List[str], errors.Error]:
	
	err_details = {
		'method': 'settle_payment',
		'req': req
	}

	transaction_ids = []

	with session_scope(session_maker) as session:

		loans = cast(
			List[models.Loan],
			session.query(models.Loan).filter(
				models.Loan.company_id == req['company_id']
			).filter(
				models.Loan.id.in_(req['loan_ids'])
			).all())

		if not loans:
			return None, errors.Error('No loans associated with settlement request', details=err_details)

		if len(loans) != len(req['loan_ids']):
			return None, errors.Error('Not all loans found in database to settle', details=err_details)

		if len(req['transaction_inputs']) != len(loans):
			return None, errors.Error('Unequal amount of transaction inputs provided relative to loans provided', details=err_details)

		loan_id_to_loan = {}
		for loan in loans:
			loan_id_to_loan[str(loan.id)] = loan

		payment = cast(
			models.Payment,
			session.query(models.Payment).filter(
				models.Payment.id == req['payment_id']
			).first())
		if not payment:
			return None, errors.Error('No payment found to settle transaction', details=err_details)

		if payment.applied_at:
			return None, errors.Error('Cannot use this payment because it has already been applied to certain loans', details=err_details)

		if payment.type != db_constants.PaymentType.REPAYMENT:
			return None, errors.Error('Can only apply repayments against loans', details=err_details)

		transactions_sum = 0.0

		for i in range(len(req['transaction_inputs'])):
			tx_input = req['transaction_inputs'][i]

			if tx_input['to_principal'] < 0 or tx_input['to_interest'] < 0 or tx_input['to_fees'] < 0:
				return None, errors.Error('No negative values can be applied using transactions', details=err_details)

			cur_sum = tx_input['to_principal'] + tx_input['to_interest'] + tx_input['to_fees']
			if not number_util.float_eq(cur_sum, tx_input['amount']):
				return None, errors.Error('Transaction at index {} does not balance with itself'.format(i), details=err_details)

			transactions_sum += cur_sum

		if not number_util.float_eq(transactions_sum, float(payment.amount)):
			return None, errors.Error('Transaction inputs provided does not balance with the payment amount included', details=err_details)

		payment_effective_date = date_util.load_date_str(req['effective_date'])
		payment_deposit_date = date_util.load_date_str(req['deposit_date'])

		for i in range(len(req['transaction_inputs'])):
			cur_loan_id = req['loan_ids'][i]
			cur_loan = loan_id_to_loan[cur_loan_id]

			tx_input = req['transaction_inputs'][i]
			to_principal = decimal.Decimal(tx_input['to_principal'])
			to_interest = decimal.Decimal(tx_input['to_interest'])
			to_fees = decimal.Decimal(tx_input['to_fees'])

			t = models.Transaction()
			t.type = db_constants.PaymentType.REPAYMENT
			t.amount = decimal.Decimal(tx_input['amount'])
			t.to_principal = to_principal
			t.to_interest = to_interest
			t.to_fees = to_fees
			t.loan_id = cur_loan_id
			t.payment_id = req['payment_id']
			t.created_by_user_id = user_id
			t.effective_date = payment_effective_date
			session.add(t)
			session.flush()
			transaction_ids.append(str(t.id))

			cur_loan.outstanding_principal_balance = cur_loan.outstanding_principal_balance - to_principal
			cur_loan.outstanding_interest = cur_loan.outstanding_interest - to_interest
			cur_loan.outstanding_fees = cur_loan.outstanding_fees - to_fees

		payment_util.make_payment_applied(
			payment, 
			applied_by_user_id=user_id, 
			deposit_date=payment_deposit_date,
			effective_date=payment_effective_date
		)

	return transaction_ids, None
