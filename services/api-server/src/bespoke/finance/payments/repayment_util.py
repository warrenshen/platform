
import datetime
import decimal
from typing import Any, Callable, Dict, List, Optional, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models, models_util
from bespoke.db.db_constants import (LoanStatusEnum, PaymentMethodEnum,
                                     PaymentStatusEnum, ProductType)
from bespoke.db.models import session_scope
from bespoke.finance import contract_util, number_util
from bespoke.finance.loans import loan_calculator
from bespoke.finance.payments import payment_util
from bespoke.finance.types import per_customer_types
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

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
	'payable_amount_principal': float,
	'payable_amount_interest': float,
	'loans_to_show': List[LoanToShowDict],
	'amount_to_pay': float,
	'amount_as_credit_to_user': float, # If the user overpaid more than what they could possibly owe, we keep this amount as a credit to them.
	'loans_past_due_but_not_selected': List[LoanToShowDict]
})

ScheduleRepaymentReqDict = TypedDict('ScheduleRepaymentReqDict', {
	'company_id': str,
	'payment_id': str,
	'amount': float,
	'payment_date': str, # When the payment was deposited into the bank
	'items_covered': payment_util.PaymentItemsCoveredDict,
})

SettleRepaymentReqDict = TypedDict('SettleRepaymentReqDict', {
	'company_id': str,
	'payment_id': str,
	'amount': float,
	'deposit_date': str, # When the payment was deposited into the bank
	'settlement_date': str, # Effective date of all the transactions as well
	'amount_as_credit_to_user': float,
	'items_covered': payment_util.PaymentItemsCoveredDict,
	'transaction_inputs': List[TransactionInputDict],
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
	company_id: str,
	payment_option: str,
	amount: float,
	settlement_date: str,
	loan_ids: List[str],
	session_maker: Callable,
	test_only_skip_interest_and_fees_calculation: bool = False,
) -> Tuple[RepaymentEffectRespDict, errors.Error]:
	# What loans and fees does would this payment pay off?

	err_details = {'company_id': company_id, 'loan_ids': loan_ids, 'method': 'calculate_repayment_effect'}

	if payment_option == 'custom_amount':
		if not number_util.is_number(amount) or amount <= 0:
			return None, errors.Error('Payment amount must greater than 0 when payment option is Custom Amount')

	if not settlement_date:
		return None, errors.Error('Settlement date must be specified')

	payment_settlement_date = date_util.load_date_str(settlement_date)

	with session_scope(session_maker) as session:
		# Get all contracts associated with company.
		contracts = cast(
			List[models.Contract],
			session.query(models.Contract).filter(
				models.Contract.company_id == company_id
			).all())
		if not contracts:
			return None, errors.Error('Cannot calculate repayment effect because no contracts are setup for this company')

		contract_dicts = [c.as_dict() for c in contracts]

	contract_helper, err = contract_util.ContractHelper.build(company_id, contract_dicts)
	if err:
		return None, err

	active_contract, err = contract_helper.get_contract(payment_settlement_date)
	if err:
		return None, err
	if not active_contract:
		return None, errors.Error('No active contract on settlement date')
	product_type, err = active_contract.get_product_type()

	# Figure out how much is due by a particular date
	loan_dicts = []

	with session_scope(session_maker) as session:
		loans = []
		if product_type == ProductType.LINE_OF_CREDIT:
			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.company_id == company_id
				).filter(
					models.Loan.closed_at == None
				))
		else:
			if not loan_ids:
				return None, errors.Error('No loan ids are selected')

			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.company_id == company_id
				).filter(
					models.Loan.id.in_(loan_ids)
				).all())

			if len(loans) != len(loan_ids):
				return None, errors.Error('Not all selected loans found')

			# TODO(warrenshen): add this check back in and update unit tests.
			# not_funded_loan_ids = [loan.id for loan in loans if not loan.funded_at]
			# if len(not_funded_loan_ids) > 0:
			# 	return None, errors.Error('Not all selected loans are funded')

			closed_loan_ids = [loan.id for loan in loans if loan.closed_at]
			if len(closed_loan_ids) > 0:
				return None, errors.Error('Some selected loans are closed already')

		selected_loan_ids = set([])
		for loan in loans:
			selected_loan_ids.add(str(loan.id))
			loan_dicts.append(loan.as_dict())

		loans_past_due = cast(
			List[models.Loan],
			session.query(models.Loan).filter(
				models.Loan.company_id == company_id
			).filter(
				models.Loan.closed_at == None
			).filter(
				models.Loan.adjusted_maturity_date <= payment_settlement_date.isoformat()
			))

		loans_past_due_ids = set([])
		loans_past_due_dicts = []
		for loan_past_due in loans_past_due:
			past_due_loan_id = str(loan_past_due.id)
			loans_past_due_ids.add(past_due_loan_id)
			loans_past_due_dicts.append(loan_past_due.as_dict())

		# Get transactions associated with all the loans selected.
		all_loan_ids = selected_loan_ids.union(loans_past_due_ids)
		transactions = cast(
			List[models.Transaction],
			session.query(models.Transaction).filter(
				models.Transaction.loan_id.in_(all_loan_ids)
			).all())

		# Get the payments associated with the loan
		all_transaction_dicts = []
		all_payment_ids = []
		if transactions:
			for t in transactions:
				all_transaction_dicts.append(t.as_dict())
				all_payment_ids.append(str(t.payment_id))

		existing_payments = cast(
			List[models.Payment],
			session.query(models.Payment).filter(
				models.Payment.id.in_(all_payment_ids)
			).all())

		all_augmented_transactions, err = models_util.get_augmented_transactions(
			all_transaction_dicts, [p.as_dict() for p in existing_payments]
		)
		if err:
			return None, err

	# Calculate the loans "before" by running the loan calculator to determine
	# the balance at that particular time.
	report_date = payment_settlement_date
	loan_dict_and_balance_list: List[LoanDictAndBalance] = []

	# Find the before balances for the loans
	fee_accumulator = loan_calculator.FeeAccumulator()
	for loan_dict in loan_dicts:
		calculator = loan_calculator.LoanCalculator(contract_helper, fee_accumulator)
		transactions_for_loan = loan_calculator.get_transactions_for_loan(
			loan_dict['id'], all_augmented_transactions)
		loan_update, errs = calculator.calculate_loan_balance(
			loan_dict,
			transactions_for_loan,
			report_date,
			includes_future_transactions=True,
		)
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
	fee_accumulator_past_due = loan_calculator.FeeAccumulator()
	# List out the before balances for unselected, but overdue loans to show to the user.
	for loan_past_due_dict in loans_past_due_dicts:
		past_due_loan_id = loan_past_due_dict['id']
		if past_due_loan_id in selected_loan_ids:
			continue

		calculator = loan_calculator.LoanCalculator(contract_helper, fee_accumulator_past_due)
		transactions_for_loan = loan_calculator.get_transactions_for_loan(
			past_due_loan_id, all_augmented_transactions)
		loan_update, errs = calculator.calculate_loan_balance(
			loan_past_due_dict,
			transactions_for_loan,
			report_date,
			includes_future_transactions=True,
		)
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
		amount_to_pay = amount
		amount_left = amount_to_pay

		# Apply in the order of earliest maturity date to latest maturity date
		# while trying to cover as much of the loan coming due earliest
		# Also paying off loans and fees takes preference over principal.
		loan_dict_and_balance_list.sort(key=lambda l: (l['loan']['adjusted_maturity_date'], l['loan']['origination_date'], l['loan']['created_at']))
		for loan_and_before_balance in loan_dict_and_balance_list:
			balance_before = loan_and_before_balance['before_balance']
			loan_dict = loan_and_before_balance['loan']

			if (
				product_type == ProductType.LINE_OF_CREDIT and
				number_util.float_lte(amount_left, 0)
			):
				continue

			# Order MATTERS: payment is applied to interest, fees, and principal, in that order.
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
		# Any amount remaining is stored as a separate transaction which counts
		# as a user credit
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
						amount=0.0,
						to_principal=0.0,
						to_interest=0.0,
						to_fees=0.0,
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

	payable_amount_principal = 0.0
	payable_amount_interest = 0.0

	for loan_to_show in loans_to_show:
		before_loan_balance = loan_to_show['before_loan_balance']
		payable_amount_principal += before_loan_balance['outstanding_principal_balance']
		payable_amount_interest += before_loan_balance['outstanding_interest']

	return RepaymentEffectRespDict(
		status='OK',
		payable_amount_principal=payable_amount_principal,
		payable_amount_interest=payable_amount_interest,
		loans_to_show=loans_to_show,
		amount_to_pay=amount_to_pay,
		amount_as_credit_to_user=amount_as_credit_to_user,
		loans_past_due_but_not_selected=loans_past_due_but_not_selected
	), None

def create_repayment(
	company_id: str,
	payment_insert_input: payment_util.PaymentInsertInputDict,
	user_id: str,
	session_maker: Callable,
	is_line_of_credit: bool,
) -> Tuple[str, errors.Error]:

	err_details = {'company_id': company_id, 'method': 'create_repayment'}

	payment_method = payment_insert_input['method']
	requested_payment_date = date_util.load_date_str(payment_insert_input['requested_payment_date'])
	requested_amount = payment_insert_input['requested_amount']
	items_covered = payment_insert_input['items_covered']
	loan_ids = None

	if not payment_method:
		return None, errors.Error('Payment method must be specified', details=err_details)

	if not number_util.is_number(requested_amount) or requested_amount <= 0:
		return None, errors.Error('Payment requested amount must greater than 0', details=err_details)

	if not requested_payment_date:
		return None, errors.Error('Requested payment date must be specified', details=err_details)

	if is_line_of_credit:
		if 'requested_to_principal' not in items_covered or 'requested_to_interest' not in items_covered:
			return None, errors.Error('items_covered.requested_to_principal and items_covered.requested_to_interest must be specified', details=err_details)

		requested_to_principal = items_covered['requested_to_principal']
		requested_to_interest = items_covered['requested_to_interest']
		if not number_util.float_eq(requested_amount, requested_to_principal + requested_to_interest):
			return None, errors.Error(f'Requested breakdown of requested_to_principal vs requested_to_interest ({requested_to_principal}, {requested_to_interest}) does not sum up to requested amount ({requested_amount})')
	else:
		if 'loan_ids' not in items_covered:
			return None, errors.Error('items_covered.loan_ids must be specified', details=err_details)

		loan_ids = items_covered['loan_ids']
		if len(loan_ids) <= 0:
			return None, errors.Error('At least one loan ID must be specified')

	payment_id = None

	with session_scope(session_maker) as session:
		loans = []
		if not is_line_of_credit:
			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.company_id == company_id
				).filter(
					models.Loan.id.in_(loan_ids)
				).all())

			if len(loans) != len(loan_ids):
				return None, errors.Error('Not all selected loans found')

			not_funded_loan_ids = [loan.id for loan in loans if not loan.funded_at]
			if len(not_funded_loan_ids) > 0:
				return None, errors.Error('Not all selected loans are funded')

			closed_loan_ids = [loan.id for loan in loans if loan.closed_at]
			if len(closed_loan_ids) > 0:
				return None, errors.Error('Some selected loans are closed already')

		# Settlement date should not be set until the banker settles the payment.
		payment_input = payment_util.RepaymentPaymentInputDict(
			payment_method=payment_method,
			requested_amount=requested_amount,
			requested_payment_date=requested_payment_date,
			payment_date=requested_payment_date if payment_method != PaymentMethodEnum.REVERSE_DRAFT_ACH else None,
			items_covered=items_covered,
		)
		payment = payment_util.create_repayment_payment(
			company_id, payment_input, user_id)
		payment.requested_by_user_id = user_id

		session.add(payment)
		session.flush()
		payment_id = str(payment.id)

		is_scheduled = payment_method == PaymentMethodEnum.REVERSE_DRAFT_ACH
		payment_status = PaymentStatusEnum.SCHEDULED if is_scheduled else PaymentStatusEnum.PENDING

		for loan in loans:
			loan.payment_status = payment_status

	return payment_id, None

def schedule_repayment(
	company_id: str,
	payment_id: str,
	req: ScheduleRepaymentReqDict,
	user_id: str,
	session_maker: Callable,
	is_line_of_credit: bool,
) -> Tuple[str, errors.Error]:

	err_details = {'company_id': company_id, 'payment_id': payment_id, 'method': 'schedule_repayment'}

	payment_date = date_util.load_date_str(req['payment_date'])
	payment_amount = req['amount']
	items_covered = req['items_covered']

	if not number_util.is_number(payment_amount) or payment_amount <= 0:
		return None, errors.Error('Payment amount must greater than 0', details=err_details)

	if not payment_date:
		return None, errors.Error('Payment date must be specified', details=err_details)

	if is_line_of_credit:
		if 'to_principal' not in items_covered or 'to_interest' not in items_covered:
			return None, errors.Error('items_covered.to_principal and items_covered.to_interest must be specified', details=err_details)

		to_principal = items_covered['to_principal']
		to_interest = items_covered['to_interest']
		if not number_util.float_eq(payment_amount, to_principal + to_interest):
			return None, errors.Error(f'Requested breakdown of to_principal vs to_interest ({to_principal}, {to_interest}) does not sum up to requested amount ({payment_amount})')
	else:
		if 'loan_ids' not in items_covered:
			return None, errors.Error('items_covered.loan_ids must be specified', details=err_details)

	payment_id = None

	with session_scope(session_maker) as session:
		payment = cast(
			models.Payment,
			session.query(models.Payment).filter(
				models.Payment.id == req['payment_id']
			).first())

		if not payment:
			return None, errors.Error('No payment found to settle transaction', details=err_details)

		if not payment.method == PaymentMethodEnum.REVERSE_DRAFT_ACH:
			return None, errors.Error('Payment method must be Reverse Draft ACH', details=err_details)

		if payment_amount > payment.requested_amount:
			return None, errors.Error('Payment amount cannot be greater than requested payment amount', details=err_details)

		if payment_date < payment.requested_payment_date:
			return None, errors.Error('Payment date cannot be before the requested payment date', details=err_details)

		loans = []
		if not is_line_of_credit:
			loan_ids = items_covered['loan_ids']
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

		payment.amount = decimal.Decimal(payment_amount)
		payment.payment_date = payment_date
		payment.items_covered = cast(Dict[str, Any], items_covered)

		# Settlement date should not be set until the banker settles the payment.
		session.flush()
		payment_id = str(payment.id)

		# TODO(warrenshen): look into these statuses, perhaps we need a "Requested"?
		payment_status = PaymentStatusEnum.SCHEDULED
		for loan in loans:
			loan.payment_status = payment_status

	return payment_id, None

def settle_repayment(
	req: SettleRepaymentReqDict,
	user_id: str,
	session_maker: Callable,
	is_line_of_credit: bool,
) -> Tuple[List[str], errors.Error]:

	err_details = {
		'method': 'settle_repayment',
		'req': req
	}

	payment_amount = req['amount']
	deposit_date = date_util.load_date_str(req['deposit_date'])
	settlement_date = date_util.load_date_str(req['settlement_date'])
	items_covered = req['items_covered']
	credit_to_user = req['amount_as_credit_to_user']
	transaction_inputs = []

	if not deposit_date:
		return None, errors.Error('deposit_date must be specified')

	if not settlement_date:
		return None, errors.Error('settlement_date must be specified')

	if is_line_of_credit:
		if 'to_principal' not in items_covered or 'to_interest' not in items_covered:
			return None, errors.Error('items_covered.to_principal and items_covered.to_interest must be specified', details=err_details)

		to_principal = items_covered['to_principal']
		to_interest = items_covered['to_interest']
		if not number_util.float_eq(payment_amount, to_principal + to_interest + credit_to_user):
			return None, errors.Error(f'Requested breakdown of to_principal vs to_interest ({to_principal}, {to_interest}) does not sum up to requested amount ({payment_amount})')
	else:
		if not items_covered or 'loan_ids' not in items_covered:
			return None, errors.Error('items_covered.loan_ids must be specified', details=err_details)

		transaction_inputs = req['transaction_inputs']

		if not transaction_inputs or len(transaction_inputs) <= 0:
			return None, errors.Error('transaction_inputs must be specified', details=err_details)

		transactions_sum = 0.0

		for i in range(len(transaction_inputs)):
			tx_input = transaction_inputs[i]

			if tx_input['to_principal'] < 0 or tx_input['to_interest'] < 0 or tx_input['to_fees'] < 0:
				return None, errors.Error('No negative values can be applied using transactions', details=err_details)

			cur_sum = tx_input['to_principal'] + tx_input['to_interest'] + tx_input['to_fees']
			if not number_util.float_eq(cur_sum, tx_input['amount']):
				return None, errors.Error('Transaction at index {} does not balance with itself'.format(i), details=err_details)

			transactions_sum += cur_sum

		computed_payment_amount = transactions_sum + credit_to_user
		if not number_util.float_eq(computed_payment_amount, payment_amount):
			return None, errors.Error(f'Sum of transactions and credit to user ({computed_payment_amount}) does not equal payment amount ({payment_amount})', details=err_details)

	def _settle_logic(session: Session) -> Tuple[bool, errors.Error]:
		contracts = cast(
			List[models.Contract],
			session.query(models.Contract).filter(
				models.Contract.company_id == req['company_id']
			).all())
		if not contracts:
			return None, errors.Error('Cannot settle payment because no contracts are setup for this company')

		contract_dicts = [c.as_dict() for c in contracts]

		contract_helper, err = contract_util.ContractHelper.build(req['company_id'], contract_dicts)
		if err:
			return None, err

		active_contract, err = contract_helper.get_contract(settlement_date)
		if err:
			return None, err
		if not active_contract:
			return None, errors.Error('No active contract on settlement date')

		loan_ids = []
		loans = []
		if is_line_of_credit:
			product_type, err = active_contract.get_product_type()
			if product_type != ProductType.LINE_OF_CREDIT:
				return None, errors.Error('Customer is not of Line of Credit product type', details=err_details)

			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.company_id == req['company_id']
				).filter(
					models.Loan.closed_at == None
				).all())

			loan_ids = list(map(lambda loan: str(loan.id), loans))
		else:
			loan_ids = items_covered['loan_ids']
			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.company_id == req['company_id']
				).filter(
					models.Loan.id.in_(loan_ids)
				).all())

			if not loans:
				return None, errors.Error('No loans associated with settlement request', details=err_details)

			if len(loans) != len(loan_ids):
				return None, errors.Error('Not all loans found in database to settle', details=err_details)

			if len(transaction_inputs) != len(loans):
				return None, errors.Error('Unequal amount of transaction inputs provided relative to loans provided', details=err_details)

		loan_id_to_loan = {}
		for loan in loans:
			loan_id_to_loan[str(loan.id)] = loan

		transactions = cast(
			List[models.Transaction],
			session.query(models.Transaction).filter(
				models.Transaction.loan_id.in_(loan_ids)
			).all())

		# Get the payments associated with the loan
		all_transaction_dicts = []
		all_payment_ids = []
		if transactions:
			for t in transactions:
				all_transaction_dicts.append(t.as_dict())
				all_payment_ids.append(str(t.payment_id))

		existing_payments = cast(
			List[models.Payment],
			session.query(models.Payment).filter(
				models.Payment.id.in_(all_payment_ids)
			).all())

		all_augmented_transactions, err = models_util.get_augmented_transactions(
			all_transaction_dicts, [p.as_dict() for p in existing_payments]
		)
		if err:
			return None, err

		# Do NOT allow settling a new payment for loans if payment.settlement_date is prior to
		# the effective_date of any existing transaction(s) related to the loans.
		#
		# Why? Say we have the following:
		# Loan L with transactions T1, T2, and T3 with the following settlement dates:
		# T1: "10/10/2020"
		# T2: "10/11/2020"
		# T3: "10/16/2020"
		#
		# Proposed payment P with the following settlement date: "10/14/2020".
		#
		# T3 was created with the assumption that the only transactions associated
		# with L are T1 and T2. But if we accept P, this will create a transaction
		# T4 which impacts interest & fees calculations before T3 happen. This means
		# T3 will now be incorrect, since it was created based on T1 and T2 but
		# should be created on T1, T2, and T4.
		effective_dates = [augmented_transaction['transaction']['effective_date'] for augmented_transaction in all_augmented_transactions]
		if len(effective_dates):
			max_transaction_effective_date = max(effective_dates)
			if settlement_date < max_transaction_effective_date:
				return None, errors.Error('Cannot settle a new payment for loans since the settlement date is prior to the effective_date of one or more existing transaction(s) of loans')

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

		if not payment.payment_date:
			return None, errors.Error('Payment must have a payment date')

		if deposit_date < payment.payment_date:
			return None, errors.Error('Deposit date cannot be before the payment date', details=err_details)

		# Note: it is important that we use `loan_ids` to create `loan_dicts`.
		# This is because the order of `loan_ids` maps to the order of
		# transactions in `transaction_inputs`.
		loan_dicts = [loan_id_to_loan[loan_id].as_dict() for loan_id in loan_ids]
		loan_dict_and_balance_list: List[LoanDictAndBalance] = []

		# Find the before balances for the loans
		fee_accumulator = loan_calculator.FeeAccumulator()
		for loan_dict in loan_dicts:
			calculator = loan_calculator.LoanCalculator(contract_helper, fee_accumulator)
			transactions_for_loan = loan_calculator.get_transactions_for_loan(
				loan_dict['id'], all_augmented_transactions)
			loan_update, errs = calculator.calculate_loan_balance(
				loan_dict,
				transactions_for_loan,
				settlement_date,
				includes_future_transactions=True,
			)
			if errs:
				return None, errors.Error('\n'.join([err.msg for err in errs]))

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

		if is_line_of_credit:
			payment_amount_to_principal = req['items_covered']['to_principal']
			payment_amount_to_interest = req['items_covered']['to_interest']
			amount_to_principal_left = payment_amount_to_principal
			amount_to_interest_left = payment_amount_to_interest

			# Apply in the order of earliest maturity date to latest maturity date
			# while trying to cover as much of the loan coming due earliest
			# Also paying off loans and fees takes preference over principal.
			loan_dict_and_balance_list.sort(key=lambda l: (l['loan']['adjusted_maturity_date'], l['loan']['origination_date'], l['loan']['created_at']))
			for loan_and_before_balance in loan_dict_and_balance_list:
				balance_before = loan_and_before_balance['before_balance']
				loan_dict = loan_and_before_balance['loan']

				if (
					number_util.float_lte(amount_to_principal_left, 0) and
					number_util.float_lte(amount_to_interest_left, 0)
				):
					continue

				# Order MATTERS: payment is applied to interest, fees, and principal, in that order.
				amount_to_interest_left, amount_used_interest = _apply_to(balance_before, 'interest', amount_to_interest_left)
				amount_to_interest_left, amount_used_fees = _apply_to(balance_before, 'fees', amount_to_interest_left)
				amount_to_principal_left, amount_used_principal = _apply_to(balance_before, 'principal', amount_to_principal_left)

				transaction_inputs.append(TransactionInputDict(
					amount=amount_used_fees + amount_used_interest + amount_used_principal,
					to_principal=amount_used_principal,
					to_interest=amount_used_interest,
					to_fees=amount_used_fees
				))

		if number_util.float_gt(credit_to_user, 0.0):
			payment_util.create_and_add_credit_to_user(
				company_id=req['company_id'],
				amount=credit_to_user,
				originating_payment_id=req['payment_id'],
				created_by_user_id=user_id,
				payment_date=deposit_date,
				effective_date=settlement_date,
				session=session
			)

		for i in range(len(transaction_inputs)):
			cur_loan_id = loan_dict_and_balance_list[i]['loan']['id']
			cur_loan = loan_id_to_loan[cur_loan_id]

			tx_input = transaction_inputs[i]
			to_principal = tx_input['to_principal']
			to_interest = tx_input['to_interest']
			to_fees = tx_input['to_fees']

			t = models.Transaction()
			t.type = db_constants.PaymentType.REPAYMENT
			t.amount = decimal.Decimal(tx_input['amount'])
			t.to_principal = decimal.Decimal(tx_input['to_principal'])
			t.to_interest = decimal.Decimal(tx_input['to_interest'])
			t.to_fees = decimal.Decimal(tx_input['to_fees'])
			t.loan_id = cur_loan_id
			t.payment_id = req['payment_id']
			t.created_by_user_id = user_id
			t.effective_date = settlement_date

			balance_before = loan_dict_and_balance_list[i]['before_balance']
			# We use balance_before here since we want to use loan balances
			# as of the payment.settlement_date (which may be in the future).
			new_outstanding_principal_balance = balance_before['outstanding_principal_balance'] - to_principal
			new_outstanding_interest = balance_before['outstanding_interest'] - to_interest
			new_outstanding_fees = balance_before['outstanding_fees'] - to_fees

			if number_util.float_lt(new_outstanding_interest, 0):
				return None, errors.Error(
					'Interest on a loan may not be negative. You must reduce the amount applied to interest on {} by {} and apply it to the principal'.format(
						cur_loan_id, -1 * new_outstanding_interest))

			if number_util.float_lt(new_outstanding_fees, 0):
				return None, errors.Error(
					'Fees on a loan may not be negative. You must reduce the amount applied to interest on {} by {} and apply it to the principal'.format(
						cur_loan_id, -1 * new_outstanding_fees))

			if number_util.float_lt(new_outstanding_principal_balance, 0):
				return None, errors.Error(
					f'Principal on a loan may not be negative or you must reduce the amount applied to principal on {cur_loan_id} by {-1 * new_outstanding_principal_balance}.')

			session.add(t)

			cur_loan.outstanding_principal_balance = decimal.Decimal(new_outstanding_principal_balance)
			cur_loan.outstanding_interest = decimal.Decimal(new_outstanding_interest)
			cur_loan.outstanding_fees = decimal.Decimal(new_outstanding_fees)

			no_outstanding_balance = number_util.float_lte(new_outstanding_principal_balance, 0.0) \
				and number_util.float_lte(new_outstanding_interest, 0.0) \
				and number_util.float_lte(new_outstanding_fees, 0.0)

			if no_outstanding_balance:
				cur_loan.closed_at = date_util.now()
				cur_loan.payment_status = PaymentStatusEnum.CLOSED
			else:
				cur_loan.payment_status = PaymentStatusEnum.PARTIALLY_PAID

		payment_util.make_repayment_payment_settled(
			payment,
			amount=decimal.Decimal(payment_amount),
			deposit_date=deposit_date,
			settlement_date=settlement_date,
			settled_by_user_id=user_id,
		)
		return True, None

	with session_scope(session_maker) as session:
		# Get all contracts associated with company.
		success, err = _settle_logic(session)
		if err:
			session.rollback()
			return None, err

		session.flush()

		transactions = cast(
			List[models.Transaction],
			session.query(models.Transaction).filter(
				models.Transaction.payment_id == req['payment_id']
			).all())
		transaction_ids = list(map(lambda transaction: transaction.id, transactions))

	return transaction_ids, None
