
import datetime
import decimal

from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Tuple, List, Optional, Callable, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models, db_constants
from bespoke.db.db_constants import LoanStatusEnum, PaymentMethod, PaymentStatusEnum
from bespoke.db.models import session_scope
from bespoke.finance.types import per_customer_types
from bespoke.finance import contract_util
from bespoke.finance import number_util
from bespoke.finance.payments import payment_util
from bespoke.finance.loans import loan_calculator

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

# Internal data structure to keep track of the LoanDict and the balance information together.
LoanDictAndBalance = TypedDict('LoanDictAndBalance', {
	'loan': models.LoanDict,
	'before_balance': LoanBalanceDict
})

# Information about a loan after a payment has been applied to it.
# We also show the before balance in terms of when the payment settles.
LoanToShowDict = TypedDict('LoanToShowDict', {
	'loan_id': str,
	'transaction': TransactionInputDict,
	'before_loan_balance': LoanBalanceDict,
	'after_loan_balance': LoanBalanceDict
})

RepaymentEffectRespDict = TypedDict('RepaymentEffectRespDict', {
	'status': str,
	'loans_to_show': List[LoanToShowDict],
	'amount_to_pay': float,
	'amount_as_credit_to_user': float, # If the user overpaid more than what they could possibly owe, we keep this amount as a credit to them.
	'loans_past_due_but_not_selected': List[LoanToShowDict]
})

SettlePaymentReqDict = TypedDict('SettlePaymentReqDict', {
	'company_id': str,
	'payment_id': str,
	'loan_ids': List[str],
	'transaction_inputs': List[TransactionInputDict],
	'settlement_date': str, # Effective date of all the transactions as well
	'payment_date': str # When the payment was deposited into the bank
})

def _zero_if_null(val: Optional[float]) -> float:
	if val is None:
		return 0.0
	return val

def _loan_dict_to_loan_balance(loan_dict: models.LoanDict) -> LoanBalanceDict:
	return LoanBalanceDict(
		amount=loan_dict['amount'],
		outstanding_principal_balance=_zero_if_null(
			loan_dict['outstanding_principal_balance']),
		outstanding_interest=_zero_if_null(loan_dict['outstanding_interest']),
		outstanding_fees=_zero_if_null(loan_dict['outstanding_fees'])
	)

def _apply_to(balance: LoanBalanceDict, category: str, amount_left: float) -> Tuple[float, float]:
	if category == 'principal':
		outstanding_amount = balance['outstanding_principal_balance']
	elif category == 'interest':
		outstanding_amount = balance['outstanding_interest']
	elif category == 'fees':
		outstanding_amount = balance['outstanding_fees']
	else:
		raise Exception('Unexpected category to apply to {}'.format(category))

	if outstanding_amount is None:
		amount_left_to_use = amount_left
		amount_applied = 0.0
		return amount_left_to_use, amount_applied
	elif amount_left <= outstanding_amount:
		amount_left_to_use = 0.0
		amount_applied = amount_left
		return amount_left_to_use, amount_applied
	else:
		amount_applied = outstanding_amount
		amount_left_to_use = amount_left - amount_applied
		return amount_left_to_use, amount_applied

def calculate_repayment_effect(
	payment_input: payment_util.PaymentInsertInputDict,
	payment_option: str,
	company_id: str,
	loan_ids: List[str],
	session_maker: Callable,
	test_only_skip_interest_and_fees_calculation: bool = False
	) -> Tuple[RepaymentEffectRespDict, errors.Error]:
	# What loans and fees does would this payment pay off?

	if payment_option == 'custom_amount':
		if not number_util.is_number(payment_input.get('amount')) and payment_input['amount'] <= 0:
			return None, errors.Error('Amount must greater than 0 when the payment option is Custom Amount')

	if not payment_input.get('payment_date'):
		return None, errors.Error('Payment date must be specified')

	if not payment_input.get('settlement_date'):
		return None, errors.Error('Settlement date must be specified')

	if not loan_ids:
		return None, errors.Error('No loan ids are selected')

	# Figure out how much is due by a particular date
	loan_dicts = []
	err_details = {'company_id': company_id, 'loan_ids': loan_ids, 'method': 'calculate_repayment_effect'}
	payment_settlement_date = date_util.load_date_str(payment_input['settlement_date'])

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

		selected_loan_ids = set([])
		for loan in loans:
			selected_loan_ids.add(str(loan.id))
			loan_dicts.append(loan.as_dict())

		loans_past_due = cast(
			List[models.Loan],
			session.query(models.Loan).filter(
				models.Loan.company_id == company_id
			).filter(
				models.Loan.adjusted_maturity_date <= payment_settlement_date.isoformat()
			))

		loans_past_due_ids = set([])
		loans_past_due_dicts = []
		for loan_past_due in loans_past_due:
			past_due_loan_id = str(loan_past_due.id)
			loans_past_due_ids.add(past_due_loan_id)
			loans_past_due_dicts.append(loan_past_due.as_dict())

		# Get all contracts associated with company.
		contracts = cast(
			List[models.Contract],
			session.query(models.Contract).filter(
				models.Contract.company_id == company_id
			).all())
		if not contracts:
			return None, errors.Error('Cannot calculate repayment effect, because no contracts are setup for this company')

		contract_dicts = [c.as_dict() for c in contracts]

		# Get transactions associated with all the loans selected.
		all_loan_ids = selected_loan_ids.union(loans_past_due_ids)
		transactions = cast(
			List[models.Transaction],
			session.query(models.Transaction).filter(
				models.Transaction.loan_id.in_(all_loan_ids)
			).all())

		all_transaction_dicts = []
		if transactions:
			all_transaction_dicts = [t.as_dict() for t in transactions]

	# Calculate the loans "before" by running the loan calculator to determine
	# the balance at that particular time.
	contract_helper, err = contract_util.ContractHelper.build(company_id, contract_dicts)
	if err:
		return None, err

	report_date = payment_settlement_date
	loan_dict_and_balance_list: List[LoanDictAndBalance] = []

	# Find the before balances for the loans
	for loan_dict in loan_dicts:
		calculator = loan_calculator.LoanCalculator(contract_helper)
		transactions_for_loan = loan_calculator.get_transactions_for_loan(
			loan_dict['id'], all_transaction_dicts)
		loan_update, errs = calculator.calculate_loan_balance(
			loan_dict, transactions_for_loan, report_date)
		if errs:
			return None, errors.Error('\n'.join([err.msg for err in errs]))

		if test_only_skip_interest_and_fees_calculation:
			loan_update['outstanding_interest'] = 0.0
			loan_update['outstanding_fees'] = 0.0

		# Keep track of what this loan balance is as of the date that this repayment
		# will settle (so we have to calculate the additional interest and fees that will accrue)
		loan_dict_and_balance_list.append(LoanDictAndBalance(
			loan=loan_dict,
			before_balance=LoanBalanceDict(
				amount=loan_dict['amount'],
				outstanding_principal_balance=loan_update['outstanding_principal'],
				outstanding_interest=loan_update['outstanding_interest'],
				outstanding_fees=loan_update['outstanding_fees']
			)
		))

	loans_past_due_but_not_selected = []
	# List out the before balances for unselected, but overdue loans to show to the user.
	for loan_past_due_dict in loans_past_due_dicts:
		past_due_loan_id = loan_past_due_dict['id']
		if past_due_loan_id in selected_loan_ids:
			continue

		calculator = loan_calculator.LoanCalculator(contract_helper)
		transactions_for_loan = loan_calculator.get_transactions_for_loan(
			past_due_loan_id, all_transaction_dicts)
		loan_update, errs = calculator.calculate_loan_balance(
			loan_past_due_dict, transactions_for_loan, report_date)
		if errs:
			return None, errors.Error('\n'.join([err.msg for err in errs]))

		if test_only_skip_interest_and_fees_calculation:
			loan_update['outstanding_interest'] = 0.0
			loan_update['outstanding_fees'] = 0.0

		loan_balance = LoanBalanceDict(
			amount=loan_past_due_dict['amount'],
			outstanding_principal_balance=loan_update['outstanding_principal'],
			outstanding_interest=loan_update['outstanding_interest'],
			outstanding_fees=loan_update['outstanding_fees']
		)
		# List out the unselected, but overdue loans, and what their balances will be.
		loans_past_due_but_not_selected.append(LoanToShowDict(
			loan_id=past_due_loan_id,
			transaction=None,
			before_loan_balance=loan_balance,
			after_loan_balance=loan_balance,
		))

	amount_to_pay = 0.0
	loans_to_show = []

	def _pay_off_balance_in_full(loan_id: str, before_balance: LoanBalanceDict) -> float:
		current_payment_amount = payment_util.sum([
			before_balance['outstanding_principal_balance'],
			before_balance['outstanding_interest'],
			before_balance['outstanding_fees']
		])
		loans_to_show.append(LoanToShowDict(
			loan_id=loan_id,
			transaction=TransactionInputDict(
				amount=current_payment_amount,
				to_principal=_zero_if_null(before_balance['outstanding_principal_balance']),
				to_interest=_zero_if_null(before_balance['outstanding_interest']),
				to_fees=_zero_if_null(before_balance['outstanding_fees'])
			),
			before_loan_balance=before_balance,
			after_loan_balance=LoanBalanceDict(
				amount=before_balance['amount'],
				outstanding_principal_balance=0.0,
				outstanding_interest=0.0,
				outstanding_fees=0.0
			)
		))
		return current_payment_amount

	if payment_option == 'custom_amount':
		amount_to_pay = payment_input['amount']
		amount_left = amount_to_pay

		# Apply in the order of earliest maturity date to latest maturity date
		# while trying to cover as much of the loan coming due earliest
		# Also paying off loans and fees takes preference over principal.
		loan_dict_and_balance_list.sort(key=lambda l: l['loan']['adjusted_maturity_date'])
		for loan_and_before_balance in loan_dict_and_balance_list:
			balance_before = loan_and_before_balance['before_balance']
			loan_dict = loan_and_before_balance['loan']

			amount_left, amount_used_interest = _apply_to(balance_before, 'interest', amount_left)
			amount_left, amount_used_fees = _apply_to(balance_before, 'fees', amount_left)
			amount_left, amount_used_principal = _apply_to(balance_before, 'principal', amount_left)
			loans_to_show.append(LoanToShowDict(
				loan_id=loan_dict['id'],
				transaction=TransactionInputDict(
					amount=amount_used_fees + amount_used_interest + amount_used_principal,
					to_principal=amount_used_principal,
					to_interest=amount_used_interest,
					to_fees=amount_used_fees
				),
				before_loan_balance=balance_before,
				after_loan_balance=LoanBalanceDict(
					amount=loan_dict['amount'],
					outstanding_principal_balance=_zero_if_null(
						balance_before['outstanding_principal_balance']) - amount_used_principal,
					outstanding_interest=_zero_if_null(balance_before['outstanding_interest']) - amount_used_interest,
					outstanding_fees=_zero_if_null(balance_before['outstanding_fees']) - amount_used_fees
				)
			))
		amount_as_credit_to_user = amount_left
		# Any amount remaining is stored as a negative principal balance on one of the loans
		# (we choose the last loan here for convenience)
		cur_transaction = loans_to_show[-1]['transaction']
		cur_loan_balance_after = loans_to_show[-1]['after_loan_balance']

		cur_transaction['amount'] += amount_as_credit_to_user
		cur_transaction['to_principal'] += amount_as_credit_to_user
		cur_loan_balance_after['outstanding_principal_balance'] -= amount_as_credit_to_user

	elif payment_option == 'pay_minimum_due':

		for loan_and_before_balance in loan_dict_and_balance_list:
			balance_before = loan_and_before_balance['before_balance']
			loan_dict = loan_and_before_balance['loan']
			loan_id = loan_dict['id']
			if loan_dict['adjusted_maturity_date'] > payment_settlement_date:
				# You dont have to worry about paying off this loan yet.
				# So the transaction has zero dollars and no effect to it.
				loans_to_show.append(LoanToShowDict(
					loan_id=loan_dict['id'],
					transaction=TransactionInputDict(
						amount=0.0, to_principal=0.0, to_interest=0.0, to_fees=0.0
					),
					before_loan_balance=balance_before,
					after_loan_balance=balance_before
				))
			else:
				# Pay loans that have come due.
				amount_to_pay += _pay_off_balance_in_full(loan_id, balance_before)

		amount_as_credit_to_user = 0.0
	elif payment_option == 'pay_in_full':

		for loan_and_before_balance in loan_dict_and_balance_list:
			balance_before = loan_and_before_balance['before_balance']
			loan_dict = loan_and_before_balance['loan']
			loan_id = loan_dict['id']
			amount_to_pay += _pay_off_balance_in_full(loan_id, balance_before)

		amount_as_credit_to_user = 0.0
	else:
		return None, errors.Error('Unrecognized payment option')

	return RepaymentEffectRespDict(
		status='OK',
		loans_to_show=loans_to_show,
		amount_to_pay=amount_to_pay,
		amount_as_credit_to_user=amount_as_credit_to_user,
		loans_past_due_but_not_selected=loans_past_due_but_not_selected
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
		payment.requested_by_user_id = user_id
		payment.requested_payment_date = date_util.load_date_str(payment_insert_input['payment_date'])
		# Settlement date should not be set until the banker settles the payment.

		session.add(payment)
		session.flush()
		payment_id = str(payment.id)

		is_scheduled = payment_insert_input['method'] == PaymentMethod.REVERSE_DRAFT_ACH
		payment_status = PaymentStatusEnum.SCHEDULED if is_scheduled else PaymentStatusEnum.PENDING
		for loan in loans:
			loan.payment_status = payment_status


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

		if payment.settled_at:
			return None, errors.Error('Cannot use this payment because it has already been settled and applied to certain loans', details=err_details)

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

		payment_settlement_date = date_util.load_date_str(req['settlement_date'])
		payment_date = date_util.load_date_str(req['payment_date'])

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
			t.effective_date = payment_settlement_date
			session.add(t)
			session.flush()
			transaction_ids.append(str(t.id))

			cur_loan.outstanding_principal_balance = cur_loan.outstanding_principal_balance - to_principal
			cur_loan.outstanding_interest = cur_loan.outstanding_interest - to_interest
			cur_loan.outstanding_fees = cur_loan.outstanding_fees - to_fees

			if cur_loan.outstanding_interest < 0:
				return None, errors.Error(
					'Interest on a loan may not be negative. You must reduce the amount applied to interest on {} by {} and apply it to the principal'.format(
						cur_loan_id, -1 * cur_loan.outstanding_interest))

			if cur_loan.outstanding_fees < 0:
				return None, errors.Error(
					'Fees on a loan may not be negative. You must reduce the amount applied to interest on {} by {} and apply it to the principal'.format(
						cur_loan_id, -1 * cur_loan.outstanding_fees))

			no_outstanding_balance = cur_loan.outstanding_principal_balance <= 0.0 \
				and cur_loan.outstanding_interest <= 0.0 \
				and cur_loan.outstanding_fees <= 0.0

			if no_outstanding_balance:
				cur_loan.closed_at = date_util.now()
				cur_loan.payment_status = PaymentStatusEnum.CLOSED
			else:
				cur_loan.payment_status = PaymentStatusEnum.PARTIALLY_PAID

		payment_util.make_payment_applied(
			payment,
			settled_by_user_id=user_id,
			payment_date=payment_date,
			settlement_date=payment_settlement_date
		)

	return transaction_ids, None
