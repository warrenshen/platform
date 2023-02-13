"""
	A loan calculator is an object that takes in transactions and a report date,
	and then calculates the outstanding principal, interest and fees that will
	be associated with this loan at a particular date.
"""
import copy
import datetime
import logging
from collections import OrderedDict
from datetime import timedelta
from typing import Dict, List, Tuple, Union, Set, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.finance import contract_util, number_util
from bespoke.finance.loans import fee_util
from bespoke.finance.payments import payment_util
from bespoke.finance.types import finance_types
from mypy_extensions import TypedDict

LoanFinancialStateDict = TypedDict('LoanFinancialStateDict', {
	'outstanding_principal': float,
	'outstanding_principal_for_interest': float,
	'outstanding_interest': float,
	'outstanding_fees': float,
	'amount_to_pay_interest_on': float
})

LoanUpdateDict = TypedDict('LoanUpdateDict', {
	'loan_id': str,
	'adjusted_maturity_date': datetime.date,
	'outstanding_principal': float,
	'outstanding_principal_for_interest': float,
	'outstanding_principal_past_due': float,
	'interest_paid_daily_adjustment': float, # this number is used to "pull-forward" interest revenue in the cast of cross-month repayments
	'fees_paid_daily_adjustment': float, # this number is used to "pull-forward" fee revenue in the cast of cross-month repayments
	'outstanding_interest': float,
	'outstanding_fees': float,
	'amount_to_pay_interest_on': float,
	'interest_accrued_today': float,
	'fees_accrued_today': float,
	'should_close_loan': bool,
	'repayment_date': datetime.date, # last repayment deposit date, calculated on the deposited date
	'day_last_repayment_settles': datetime.date, # last repayment settlement date, calculated on the deposit date, e.g., a "look ahead"
	'total_principal_paid': float,
	'total_interest_paid': float,
	'total_fees_paid': float,
	'financing_period': int,
	'financing_day_limit': int,
	# used during client surveillance to determine status by the *most* overdue loan, should be 0 if not late
	'days_overdue': int,
	# accounting_* is used for when a client is no longer on the happy path and 
	# we've determined that we likely won't collect interest, late fees, or both.
	# This should be considered separate from the regular columns which will track
	# what the value would have been. If the client is on the happy path, then these
	# columns and the the non accounting_* columns should match
	'accounting_outstanding_principal': float,
	'accounting_outstanding_interest': float,
	'accounting_outstanding_late_fees': float,
	'accounting_interest_accrued_today': float,
	'accounting_late_fees_accrued_today': float,
})

ThresholdInfoDict = TypedDict('ThresholdInfoDict', {
	'day_threshold_met': datetime.date
})

CalculateInterestInputDict = TypedDict('CalculateInterestInputDict', {
	'threshold_info': ThresholdInfoDict,
	'loan': models.LoanDict,
	'invoice': models.InvoiceDict, # Filled in if this loan is related to invoice financing
})

InterestFeeInfoDict = TypedDict('InterestFeeInfoDict', {
	'amount_to_pay_interest_on': float,
	'interest_due_for_day': float,
	'interest_rate_used': float,
	'fee_due_for_day': float,
	'fee_multiplier': float
})

CalculatorBalances = TypedDict('CalculatorBalances', {
	'outstanding_principal': float, # The customer sees this as their outstanding principal
	'outstanding_principal_for_interest': float, # Amount of principal used for calculating interest and fees off of
	'outstanding_interest': float,
	'outstanding_fees': float,
	'accounting_outstanding_principal': float,
	'accounting_outstanding_interest': float,
	'accounting_outstanding_late_fees': float,
	'has_been_funded': bool,
	'amount_paid_back_on_loan': float,
	'loan_paid_by_maturity_date': bool,
	'day_last_repayment_settles': datetime.date,
	'repayment_date': datetime.date,
	'total_principal_paid': float,
	'total_interest_paid': float,
	'total_fees_paid': float,
})

UpdateDebugStateDict = TypedDict('UpdateDebugStateDict', {
	'row_info': List[Union[str, int, float]]
})

LoanUpdateDebugInfoDict = TypedDict('LoanUpdateDebugInfoDict', {
	'column_names': List[str],
	'update_states': List[UpdateDebugStateDict]
})

CustomAmountSplitDict = TypedDict('CustomAmountSplitDict', {
	'to_principal': float,
	'to_interest': float,
	'to_fees': float
})

IncludedPaymentDict = TypedDict('IncludedPaymentDict', {
	'option': str, # a value in RepaymentOption
	'custom_amount': float, # needed when RepaymentOption == 'custom_amount'
	'custom_amount_split': CustomAmountSplitDict, # Takes precedence over 'custom_amount'. This is used when creating transactions for settling an LOC payment, or settling a non-LOC payment
	'deposit_date': datetime.date,
	'settlement_date': datetime.date,
	'should_pay_principal_first': bool
})

TransactionInputDict = TypedDict('TransactionInputDict', {
	'amount': float,
	'to_principal': float,
	'to_interest': float,
	'to_fees': float
})

PaymentEffectDict = TypedDict('PaymentEffectDict', {
	'loan_state_before_payment': LoanFinancialStateDict,
	'transaction': TransactionInputDict
})

CalculateResultDict = TypedDict('CalculateResultDict', {
	'payment_effect': PaymentEffectDict,
	'loan_update': LoanUpdateDict,
	'debug_info': LoanUpdateDebugInfoDict
})

class ThresholdAccumulator(object):
	"""
		An object to accumulate the principal amounts for the factoring fee threshold
	"""

	def __init__(self, contract_helper: contract_util.ContractHelper) -> None:
		self._date_to_txs: Dict[datetime.date, List[models.AugmentedTransactionDict]] = OrderedDict()
		self._contract_helper = contract_helper

	def add_transaction(self, tx: models.AugmentedTransactionDict) -> None:
		cur_date = tx['transaction']['effective_date']
		if cur_date not in self._date_to_txs:
			self._date_to_txs[cur_date] = []

		self._date_to_txs[cur_date].append(tx)

	def compute_threshold_info(self, report_date: datetime.date) -> Tuple[ThresholdInfoDict, errors.Error]:
		contract, err = self._contract_helper.get_contract(report_date)
		if err:
			return None, err

		start_date, err = contract.get_start_date()
		if err:
			return None, err

		end_date, err = contract.get_adjusted_end_date()
		if err:
			return None, err

		factoring_fee_threshold, err = contract.get_factoring_fee_threshold()
		has_threshold_set = factoring_fee_threshold > 0.0
		starting_value, starting_value_err = contract.get_factoring_fee_threshold_starting_value()
		if has_threshold_set and starting_value is None:
			return None, errors.Error('Factoring fee threshold starting value must be set if a customers factoring fee threshold is set')

		total_repayments_amount = starting_value if starting_value else 0.0
		if has_threshold_set and total_repayments_amount >= factoring_fee_threshold:
			# You crossed the threshold immediately because of carry-over
			return ThresholdInfoDict(
				day_threshold_met=start_date
			), None

		for cur_date, aug_txs in self._date_to_txs.items():

			for aug_tx in aug_txs:
				tx = aug_tx['transaction']

				if tx['effective_date'] < start_date or tx['effective_date'] > end_date or tx['effective_date'] > report_date:
					# Dont include transactions happening outside of the range
					# of the current contract in effect, or that come after
					# the current report date.
					continue

				if payment_util.is_repayment(tx):
					total_repayments_amount += tx['to_principal']

			if has_threshold_set and total_repayments_amount >= factoring_fee_threshold:
				return ThresholdInfoDict(
					day_threshold_met=cur_date
				), None

		return ThresholdInfoDict(
			day_threshold_met=None
		), None

class BalanceRange(object):
	"""
		For summarization purposes, the time a certain balance was in effect and
		the interest and fees associated with that.
	"""
	def __init__(self, start_date: datetime.date, outstanding_principal: float) -> None:
		self.start_date = start_date
		self.outstanding_principal = outstanding_principal
		self.end_date: datetime.date = None
		self.interest_rates: List[float] = []
		self.fee_multipliers: List[float] = []

	def add_end_date(self, end_date: datetime.date) -> None:
		self.end_date = end_date

	def add_fee_info(self, interest_rate: float, fee_multiplier: float) -> None:
		self.interest_rates.append(interest_rate)
		self.fee_multipliers.append(fee_multiplier)

def get_transactions_for_loan(
	loan_id: str, augmented_transactions: List[models.AugmentedTransactionDict],
	accumulator: ThresholdAccumulator = None) -> List[models.AugmentedTransactionDict]:
	loan_txs = []
	for tx in augmented_transactions:
		if tx['transaction']['loan_id'] == loan_id:
			loan_txs.append(tx)
			if accumulator:
				accumulator.add_transaction(tx)

	return loan_txs

def _apply_to(cur_loan_state: LoanFinancialStateDict, category: str, amount_left: float) -> Tuple[float, float]:
	if category == 'principal':
		outstanding_amount = cur_loan_state['outstanding_principal']
	elif category == 'interest':
		outstanding_amount = cur_loan_state['outstanding_interest']
	elif category == 'fees':
		outstanding_amount = cur_loan_state['outstanding_fees']
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
		# Only pay off up to the rounded amount
		amount_applied = number_util.round_currency(outstanding_amount)
		amount_left_to_use = amount_left - amount_applied
		return amount_left_to_use, amount_applied

def _sum_transactions(t1: TransactionInputDict, t2: TransactionInputDict) -> TransactionInputDict:
	return TransactionInputDict(
		amount=t1['amount'] + t2['amount'],
		to_principal=t1['to_principal'] + t2['to_principal'],
		to_interest=t1['to_interest'] + t2['to_interest'],
		to_fees=t1['to_fees'] + t2['to_fees']
	)

def _determine_transaction(
	loan: models.LoanDict, cur_loan_state: LoanFinancialStateDict, payment_to_include: IncludedPaymentDict) -> TransactionInputDict:
	# loan_update is the current state of the loan at the time you can
	# apply the user's desired payment

	# Determine what transaction gets created given the payment options provided
	# Paying off interest and fees takes preference over principal.
	payment_option = payment_to_include['option']
	should_pay_principal_first = payment_to_include['should_pay_principal_first']

	def _pay_in_full() -> TransactionInputDict:
		to_principal = cur_loan_state['outstanding_principal']

		current_amount = payment_util.sum([
			to_principal,
			cur_loan_state['outstanding_interest'],
			cur_loan_state['outstanding_fees']
		])

		return TransactionInputDict(
				amount=current_amount,
				# Dontn pay off principal until we reach the settlement date
				to_principal=to_principal,
				to_interest=cur_loan_state['outstanding_interest'],
				to_fees=cur_loan_state['outstanding_fees'],
			)

	if payment_option == payment_util.RepaymentOption.PAY_MINIMUM_DUE:
		if loan['adjusted_maturity_date'] > payment_to_include['settlement_date']:
			# Don't need to pay off this loan yet
			return TransactionInputDict(
				amount=0.0,
				to_principal=0.0,
				to_interest=0.0,
				to_fees=0.0,
			)
		return _pay_in_full()
	elif payment_option == payment_util.RepaymentOption.PAY_IN_FULL:
		return _pay_in_full()
	elif payment_option == payment_util.RepaymentOption.CUSTOM_AMOUNT:

		amount_left = payment_to_include['custom_amount']

		if should_pay_principal_first:
			amount_left, amount_used_principal = _apply_to(cur_loan_state, 'principal', amount_left)

		amount_left, amount_used_interest = _apply_to(cur_loan_state, 'interest', amount_left)
		amount_left, amount_used_fees = _apply_to(cur_loan_state, 'fees', amount_left)

		if not should_pay_principal_first:
			amount_left, amount_used_principal = _apply_to(cur_loan_state, 'principal', amount_left)

		return TransactionInputDict(
				amount=amount_used_fees + amount_used_interest + amount_used_principal,
				to_principal=amount_used_principal,
				to_interest=amount_used_interest,
				to_fees=amount_used_fees,
		)
	elif payment_option == payment_util.RepaymentOption.CUSTOM_AMOUNT_FOR_SETTLING_LOC:

		amount_to_principal_left = payment_to_include['custom_amount_split']['to_principal']
		amount_to_interest_left = payment_to_include['custom_amount_split']['to_interest']

		amount_to_interest_left, amount_used_interest = _apply_to(cur_loan_state, 'interest', amount_to_interest_left)
		amount_to_interest_left, amount_used_fees = _apply_to(cur_loan_state, 'fees', amount_to_interest_left)
		amount_to_principal_left, amount_used_principal = _apply_to(cur_loan_state, 'principal', amount_to_principal_left)

		return TransactionInputDict(
				amount=amount_used_fees + amount_used_interest + amount_used_principal,
				to_principal=amount_used_principal,
				to_interest=amount_used_interest,
				to_fees=amount_used_fees,
		)
	elif payment_option == payment_util.RepaymentOption.CUSTOM_AMOUNT_FOR_SETTLING_NON_LOC_LOAN:

		amount_to_principal_left = payment_to_include['custom_amount_split']['to_principal']
		amount_to_interest_left = payment_to_include['custom_amount_split']['to_interest']
		amount_to_fees_left = payment_to_include['custom_amount_split']['to_fees']

		amount_to_interest_left, amount_used_interest = _apply_to(cur_loan_state, 'interest', amount_to_interest_left)
		amount_to_fees_left, amount_used_fees = _apply_to(cur_loan_state, 'fees', amount_to_fees_left)
		amount_to_principal_left, amount_used_principal = _apply_to(cur_loan_state, 'principal', amount_to_principal_left)

		return TransactionInputDict(
				amount=amount_used_fees + amount_used_interest + amount_used_principal,
				to_principal=amount_used_principal,
				to_interest=amount_used_interest,
				to_fees=amount_used_fees,
		)

	raise errors.Error('Invalid payment option provided {}'.format(payment_option))

def _format_output_value(value: float, should_round: bool) -> float:
	# Since the above calculations do NOT round, we end up with non-zero
	# values that are "in currency terms equal to zero". For example,
	# 0.0015599999927644603 is equal to zero in terms of currency ($0.00).
	# This may happen with outstanding interest or outstanding fees: closed
	# loans may have non-zero but "in currency terms equal to zero"
	# outstanding interest and outstanding fee values.
	#
	# In this method, we squash non-zero but
	# "in currency terms equal to zero" values to zero.
	#
	# Why? Short answer: sum of negligable amounts can become significant.
	#
	# For example, say we have five closed loans, each with the following
	# "in currency terms equal to zero" outstanding interest:
	#
	# 0.0023900000099530416
	# 0.0002921595962277479
	# 0.001145248212900185
	# 0.00223000000715711622
	# 0.0018319999945314294
	#
	# All of these interests are "in currency terms equal to zero", hence
	# the loans are closed. BUT, the sum of these values equals 0.007889408,
	# which in currency terms equals $0.01 due to rounding.
	#
	# Finally, the problem arises in places where we sum over many loans.
	# This is exactly what we do to calculate financial summaries. If we do
	# not squash "in currency terms equal to zero" values to zero, those
	# sums we calculate end up including the values and end up incorrect.
	if number_util.is_currency_zero(value):
		return 0.0
	elif should_round:
		return number_util.round_currency(value)
	else:
		return value

class TransactionsHelper(object):

	def __init__(self) -> None:
		self._settlement_date_to_txs: Dict[datetime.date, List[models.AugmentedTransactionDict]] = {}
		self._deposit_date_to_txs: Dict[datetime.date, List[models.AugmentedTransactionDict]] = {}
		self.last_tx_settlement_date: datetime.date = None
		self.loan_repayment_dates: List[Tuple[datetime.date, datetime.date]] = []

	def get_transactions_on_deposit_date(self, cur_date: datetime.date) -> List[models.AugmentedTransactionDict]:
		return self._deposit_date_to_txs.get(cur_date, [])

	def get_transactions_on_settlement_date(self, cur_date: datetime.date) -> List[models.AugmentedTransactionDict]:
		return self._settlement_date_to_txs.get(cur_date, [])

	@staticmethod
	def build(
		augmented_transactions: List[models.AugmentedTransactionDict],
		payment_to_include: IncludedPaymentDict,
		today: datetime.date) -> Tuple['TransactionsHelper', errors.Error]:

		loan_repayment_dates_set: Set[Tuple[datetime.date, datetime.date]] = set([])
		last_tx_settlement_date = None
		settlement_date_to_txs: Dict[datetime.date, List[models.AugmentedTransactionDict]] = {}
		deposit_date_to_txs: Dict[datetime.date, List[models.AugmentedTransactionDict]] = {}

		for tx in augmented_transactions:
			cur_deposit_date = tx['payment']['deposit_date']
			if cur_deposit_date not in deposit_date_to_txs:
				deposit_date_to_txs[cur_deposit_date] = []
			deposit_date_to_txs[cur_deposit_date].append(tx)

			cur_settlement_date = tx['transaction']['effective_date']
			if cur_settlement_date not in settlement_date_to_txs:
				settlement_date_to_txs[cur_settlement_date] = []
			settlement_date_to_txs[cur_settlement_date].append(tx)

			if payment_util.is_repayment(tx['transaction']) and cur_deposit_date <= today:
				# If this transaction was deposited within this report date,
				# we actually need to calculate all the loan details up until its
				# settlement date.
				if not last_tx_settlement_date:
					last_tx_settlement_date = cur_settlement_date
				elif last_tx_settlement_date < cur_settlement_date:
					last_tx_settlement_date = cur_settlement_date

				loan_repayment_dates_set.add((cur_deposit_date, cur_settlement_date))

		if payment_to_include:
			# If someone is using a payment to include, also use this to count
			# when the last repayment settles
			if not last_tx_settlement_date:
				last_tx_settlement_date = payment_to_include['settlement_date']
			elif payment_to_include['settlement_date'] > last_tx_settlement_date:
				last_tx_settlement_date = payment_to_include['settlement_date']

		helper = TransactionsHelper()
		helper._deposit_date_to_txs = deposit_date_to_txs
		helper._settlement_date_to_txs = settlement_date_to_txs
		helper.last_tx_settlement_date = last_tx_settlement_date

		loan_repayment_dates = list(loan_repayment_dates_set)
		loan_repayment_dates.sort(key=lambda x: x[0]) # sort by deposit_date
		helper.loan_repayment_dates = loan_repayment_dates

		return helper, None

def _reduce_custom_amount_remaining(tx: TransactionInputDict, payment_to_include: IncludedPaymentDict) -> None:
	if not payment_to_include:
		return

	if payment_to_include['option'] == payment_util.RepaymentOption.CUSTOM_AMOUNT:
		payment_to_include['custom_amount'] -= tx['amount']

	elif payment_to_include['option'] == payment_util.RepaymentOption.CUSTOM_AMOUNT_FOR_SETTLING_LOC:
		payment_to_include['custom_amount_split']['to_principal'] -= tx['to_principal']
		payment_to_include['custom_amount_split']['to_interest'] -= tx['to_interest']
		payment_to_include['custom_amount_split']['to_interest'] -= tx['to_fees']

	elif payment_to_include['option'] == payment_util.RepaymentOption.CUSTOM_AMOUNT_FOR_SETTLING_NON_LOC_LOAN:
		payment_to_include['custom_amount_split']['to_principal'] -= tx['to_principal']
		payment_to_include['custom_amount_split']['to_interest'] -= tx['to_interest']
		payment_to_include['custom_amount_split']['to_fees'] -= tx['to_fees']

def _get_interest_and_fees_due_on_day(
	contract_helper: contract_util.ContractHelper,
	cur_date: datetime.date,
	input_dict: CalculateInterestInputDict,
	balances: CalculatorBalances,
) -> Tuple[InterestFeeInfoDict, errors.Error]:
	threshold_info = input_dict['threshold_info']
	loan = input_dict['loan']
	invoice = input_dict['invoice']

	cur_contract, err = contract_helper.get_contract(cur_date)
	if err:
		return None, err

	# Interest
	cur_interest_rate, err = cur_contract.get_interest_rate(cur_date)
	if err:
		return None, err

	product_type, err = cur_contract.get_product_type()
	if err:
		return None, err

	# Fees
	fee_multiplier = 0.0
	#print('Cur DATE {} Outstanding principal {} Principal for interest {}'.format(
	#		cur_date, outstanding_principal, outstanding_principal_for_interest))
	if cur_date > loan['adjusted_maturity_date']:
		days_past_due = (cur_date - loan['adjusted_maturity_date']).days

		fee_multiplier, err = cur_contract.get_fee_multiplier(days_past_due=days_past_due)
		if err:
			return None, err
	else:
		# Note: late fees do not accrue on the day of the maturity date.
		pass

	# NOTE: divide money into amount above threshold and amount below threshold
	factoring_fee_threshold, err = cur_contract.get_factoring_fee_threshold()
	has_threshold_set = factoring_fee_threshold > 0.0
	day_threshold_met = threshold_info['day_threshold_met']

	interest_rate_used = cur_interest_rate

	if has_threshold_set and day_threshold_met:
		# There was some day that the customer met the threshold
		if cur_date > day_threshold_met:
			# After the day we meet the threshold, everything is at the reduced interest rate
			reduced_interest_rate, err = cur_contract.get_discounted_interest_rate_due_to_factoring_fee(cur_date)
			if err:
				return None, err

			interest_rate_used = reduced_interest_rate

	is_invoice_financing = product_type == db_constants.ProductType.INVOICE_FINANCING
	amount_to_pay_interest_on = None

	if is_invoice_financing:
		if not invoice:
			return None, errors.Error('No invoice found associated with this loan, could not compute any financial details')

		if number_util.is_currency_zero(balances['outstanding_principal_for_interest']):
			# If loan is fully paid, there is no amount to pay interest on.
			amount_to_pay_interest_on = 0.0
		else:
			# If loan is not fully paid, amount to pay interest on is based on invoice subtotal and amount paid back.
			amount_to_pay_interest_on = max(0.0, invoice['subtotal_amount'] - balances['amount_paid_back_on_loan'])
	else:
		amount_to_pay_interest_on = balances['outstanding_principal_for_interest']

	if number_util.is_currency_zero(amount_to_pay_interest_on):
		interest_rate_used = 0.0
	elif number_util.round_currency(amount_to_pay_interest_on) < 0:
		logging.warn(f'Amount to pay interest on ({amount_to_pay_interest_on}) is negative on {cur_date} for loan {loan["id"]}')
		interest_due_for_day = 0.0

	interest_due_for_day = interest_rate_used * amount_to_pay_interest_on
	#print('Loan maturity date {}, Date: {}, Interest Due: {}, Fee Multiplier: {}'.format(
	#	loan['adjusted_maturity_date'], cur_date, interest_due_for_day, fee_multiplier))

	# If the customer does not have any outstanding principal by the loan maturity date,
	# even though their principal for interest is accruing, dont charge any additional fees there.
	fee_due_for_day = 0.0 if balances['loan_paid_by_maturity_date'] else fee_multiplier * interest_due_for_day
	
	return InterestFeeInfoDict(
		amount_to_pay_interest_on=amount_to_pay_interest_on,
		interest_due_for_day=interest_due_for_day,
		interest_rate_used=interest_rate_used,
		fee_due_for_day=fee_due_for_day,
		fee_multiplier=fee_multiplier,
	), None

def _update_at_beginning_of_day(
	transactions_by_settlement_date: List[models.AugmentedTransactionDict],
	balances: CalculatorBalances
) -> None:

	for aug_tx in transactions_by_settlement_date:
		tx = aug_tx['transaction']
		is_advance_or_adjustment = payment_util.is_advance(tx) or payment_util.is_adjustment(tx)
		if is_advance_or_adjustment:
			# Adjustments and advances both get applied at the beginning of the day
			balances['outstanding_principal'] += tx['to_principal']
			balances['outstanding_principal_for_interest'] += tx['to_principal']
			balances['outstanding_interest'] += tx['to_interest']
			balances['outstanding_fees'] += tx['to_fees']

			balances['accounting_outstanding_principal'] += tx['to_principal']
			balances['accounting_outstanding_interest'] += tx['to_interest']
			balances['accounting_outstanding_late_fees'] += tx['to_fees']

		if payment_util.is_advance(tx):
			balances['has_been_funded'] = True

def _update_end_of_day_repayment_deposits(
	transactions_by_deposit_date: List[models.AugmentedTransactionDict],
	balances: CalculatorBalances,
	cur_date: datetime.date,
	loan: models.LoanDict
) -> None:
	for aug_tx in transactions_by_deposit_date:
		tx = aug_tx['transaction']
		if payment_util.is_repayment(tx):
			# The outstanding principal for a loan gets reduced on the deposit date
			balances['outstanding_principal'] -= tx['to_principal']
			balances['outstanding_interest'] -= tx['to_interest']
			balances['outstanding_fees'] -= tx['to_fees']

			balances['accounting_outstanding_principal'] -= tx['to_principal']
			balances['accounting_outstanding_interest'] -= tx['to_interest']
			balances['accounting_outstanding_late_fees'] -= tx['to_fees']

			if (
				number_util.float_lte(number_util.round_currency(balances['outstanding_principal']), 0.0) and 
				cur_date <= loan['adjusted_maturity_date']
			):
				balances['loan_paid_by_maturity_date'] = True

def _update_end_of_day_repayment_settlements(
	transactions_by_settlement_date: List[models.AugmentedTransactionDict],
	balances: CalculatorBalances,
) -> None:
	for aug_tx in transactions_by_settlement_date:
		tx = aug_tx['transaction']
		if payment_util.is_repayment(tx):
			# The principal for interest calculations gets paid off on the settlement date
			balances['outstanding_principal_for_interest'] -= tx['to_principal']
			balances['amount_paid_back_on_loan'] += tx['amount']

			balances['repayment_date'] = aug_tx['payment']['deposit_date']
			balances['total_principal_paid'] += tx['to_principal']
			balances['total_interest_paid'] += tx['to_interest']
			balances['total_fees_paid'] += tx['to_fees']

def _get_additional_interest_and_fees_for_repayment_effect(
	contract_helper: contract_util.ContractHelper,
	cur_date: datetime.date, 
	payment_to_include: IncludedPaymentDict,
	inner_balances: CalculatorBalances, 
	txs_helper: TransactionsHelper,
	interest_input_dict: CalculateInterestInputDict) -> Tuple[float, float, errors.Error]:

	loan = interest_input_dict['loan']
	inner_cur_date = cur_date
	inner_end_date = payment_to_include['settlement_date']
	additional_interest = 0.0
	additional_fees = 0.0
	inner_has_err = None

	_update_end_of_day_repayment_settlements(
		txs_helper.get_transactions_on_settlement_date(cur_date),
		inner_balances
	)

	while inner_cur_date < inner_end_date:
		inner_cur_date = inner_cur_date + timedelta(days=1)
		inner_transactions_by_deposit_date = txs_helper.get_transactions_on_deposit_date(
			inner_cur_date
		)
		inner_transactions_by_settlement_date = txs_helper.get_transactions_on_settlement_date(
			inner_cur_date
		)

		_update_at_beginning_of_day(inner_transactions_by_settlement_date, inner_balances)

		inner_interest_fee_info, err = _get_interest_and_fees_due_on_day(
			contract_helper,
			inner_cur_date,
			interest_input_dict,
			inner_balances
		)
		if err:
			return None, None, err

		_update_end_of_day_repayment_deposits(inner_transactions_by_deposit_date, inner_balances, inner_cur_date, loan)
		_update_end_of_day_repayment_settlements(
			inner_transactions_by_settlement_date,
			inner_balances
		)

		additional_interest += inner_interest_fee_info['interest_due_for_day']
		additional_fees += inner_interest_fee_info['fee_due_for_day']

	return additional_interest, additional_fees, None

def _perform_daily_interest_and_fees_adjustment(fee_accumulator: fee_util.FeeAccumulator, txs_helper: TransactionsHelper, date_to_result: Dict[datetime.date, CalculateResultDict]) -> Tuple[bool, errors.Error]:
	# Iterate through days that had a repayment deposited
	# Within each deposit - settlement window, re-distribute the interest
	# adjustments so:
	#  1) the Finance team can book revenue within the same month the payment deposits
	#  2) We can close out the loan on the deposit date, because we know they
	#     paid enough of the interest / fees that will collect by the settlement date
	performed_adjustment_by_month: Dict[finance_types.Month, bool] = {}

	for deposit_date, settlement_date in txs_helper.loan_repayment_dates:
		
		settlement_update = date_to_result[settlement_date]['loan_update']
		if settlement_update['should_close_loan']:
			# If the loan was closed on the settlement date, then we can
			# close it out by the deposit_date, and all days leading up to the
			# settlement date
			cur_date = deposit_date
			while cur_date <= settlement_date:
				date_to_result[cur_date]['loan_update']['should_close_loan'] = True
				date_to_result[cur_date]['loan_update']['financing_period'] = settlement_update['financing_period']
				cur_date = cur_date + timedelta(days=1)

		cur_month_tuple = finance_types.Month(month=deposit_date.month, year=deposit_date.year)

		performed_cross_month_adjustment = performed_adjustment_by_month.get(cur_month_tuple)
		if performed_cross_month_adjustment:
			continue

		# Only do this adjustment once per unique month
		is_cross_month_repayment = deposit_date.month != settlement_date.month
		if is_cross_month_repayment:
			# For a cross-month repayment, move the extra interest paid 
			# on deposit_date.month (that paid off some of settlement_date.month)
			# as an interest adjustment on the last day of deposit_date.month

			# the amount of negative interest on the deposit date is the amount
			# of interest paid to cover the interest accrued during the settlement
			# days
			extra_interest_paid = abs(min(0.0, date_to_result[deposit_date]['loan_update']['outstanding_interest']))
			extra_fees_paid = abs(min(0.0, date_to_result[deposit_date]['loan_update']['outstanding_fees']))
			#print('You initially paid an extra {} on {}'.format(extra_interest_paid, deposit_date))
			
			cur_date = deposit_date + timedelta(days=1)
			while cur_date <= settlement_date:
				# For subsequent days, interest collected in the same month
				# subtract from what needs to be adjusted from the next month's
				# interest collected
				if cur_date.month == deposit_date.month:
					extra_interest_paid -= date_to_result[cur_date]['loan_update']['interest_accrued_today']		
					extra_fees_paid -= date_to_result[cur_date]['loan_update']['fees_accrued_today']
					#print('Subtracting that accrued {} on {}'.format(date_to_result[cur_date]['loan_update']['interest_accrued_today'], cur_date))

				cur_date = cur_date + timedelta(days=1)

			if extra_interest_paid > 0:
				# Only do an adjustment if you have extra interest paid in this month
				# that should be "pulled forward"

				settlement_month = finance_types.Month(month=settlement_date.month, year=settlement_date.year)
				interest_accumulated_in_settlement_month, err = fee_accumulator.get_amount_interest_accrued_by_month(settlement_month)
				if err:
					return None, err

				#print('You have {} that was accumulated in month {} that can be subtracted off those days'.format(
				#		interest_accumulated_in_settlement_month, settlement_month))

				if extra_interest_paid > interest_accumulated_in_settlement_month:
					end_of_month_adjustment = interest_accumulated_in_settlement_month
				else:
					end_of_month_adjustment = extra_interest_paid
					
				last_day_of_month = date_util.get_last_day_of_month(year=deposit_date.year, month=deposit_date.month)
				end_of_month = datetime.date(year=deposit_date.year, month=deposit_date.month, day=last_day_of_month)
				first_of_next_month = datetime.date(year=settlement_date.year, month=settlement_date.month, day=1)
				date_to_result[end_of_month]['loan_update']['interest_paid_daily_adjustment'] = end_of_month_adjustment
				date_to_result[first_of_next_month]['loan_update']['interest_paid_daily_adjustment'] = -end_of_month_adjustment

			if extra_fees_paid > 0:
				# Only do an adjustment if you have extra interest paid in this month
				# that should be "pulled forward"

				settlement_month = finance_types.Month(month=settlement_date.month, year=settlement_date.year)
				fees_accumulated_in_settlement_month, err = fee_accumulator.get_amount_fees_accrued_by_month(settlement_month)
				if err:
					return None, err

				#print('You have {} in fees that was accumulated in month {} that can be subtracted off those days'.format(
				#		fees_accumulated_in_settlement_month, settlement_month))

				if extra_fees_paid > fees_accumulated_in_settlement_month:
					end_of_month_fee_adjustment = fees_accumulated_in_settlement_month
				else:
					end_of_month_fee_adjustment = extra_fees_paid
					
				last_day_of_month = date_util.get_last_day_of_month(year=deposit_date.year, month=deposit_date.month)
				end_of_month = datetime.date(year=deposit_date.year, month=deposit_date.month, day=last_day_of_month)
				first_of_next_month = datetime.date(year=settlement_date.year, month=settlement_date.month, day=1)
				date_to_result[end_of_month]['loan_update']['fees_paid_daily_adjustment'] = end_of_month_fee_adjustment
				date_to_result[first_of_next_month]['loan_update']['fees_paid_daily_adjustment'] = -end_of_month_fee_adjustment

			performed_adjustment_by_month[cur_month_tuple] = True

	return True, None

class LoanCalculator(object):
	"""
		Helps calculate and summarize the history of the loan with respect to
		how the interest and fees are accumulated.
	"""
	def __init__(self, contract_helper: contract_util.ContractHelper, fee_accumulator: fee_util.FeeAccumulator) -> None:
		self._contract_helper = contract_helper
		self._fee_accumulator = fee_accumulator

	def _calculate_loan_balance_internal(
		self,
		threshold_info: ThresholdInfoDict,
		loan: models.LoanDict,
		invoice: models.InvoiceDict, # Filled in if this loan is related to invoice financing
		company_settings: models.CompanySettingsDict,
		augmented_transactions: List[models.AugmentedTransactionDict],
		today: datetime.date,
		should_round_output: bool = True,
		payment_to_include: IncludedPaymentDict = None,
		include_debug_info: bool = False,
		now_for_test: datetime.datetime = None,
	) -> Tuple[CalculateResultDict, List[errors.Error]]:
		# Replay the history of the loan and all the expenses that are due as a result.
		# Heres what you owe based on the transaction history applied to your loan.

		if not loan['origination_date']:
			return None, [errors.Error('Could not determine loan balance for loan_id={} because it has no origination_date set'.format(
				loan['id']))]

		# For each day between today and the origination date, you need to calculate interest and fees
		# and consider transactions along the way.
		balances = CalculatorBalances(
			outstanding_principal = 0.0, # The customer sees this as their outstanding principal
			outstanding_principal_for_interest = 0.0, # Amount of principal used for calculating interest and fees off of
			outstanding_interest = 0.0,
			outstanding_fees = 0.0,
			accounting_outstanding_principal = 0.0,
			accounting_outstanding_interest = 0.0,
			accounting_outstanding_late_fees = 0.0,
			has_been_funded = False,
			amount_paid_back_on_loan = 0.0,
			loan_paid_by_maturity_date = False,
			day_last_repayment_settles=None,

			# Report values: values used for reporting purposes ONLY.
			repayment_date = None,
			total_principal_paid = 0.0,
			total_interest_paid = 0.0,
			total_fees_paid = 0.0,
		)

		amount_to_pay_interest_on = 0.0 # The exact amount on a given day that the person paid interest on
		interest_accrued_today = 0.0
		fees_accrued_today = 0.0

		# Variables used to calculate the repayment effect
		payment_effect_dict = None # Only filled in when payment_to_include is incorporated
		inserted_repayment_transaction = None # A transaction which would occur, if the user did indeed include this payment
		debug_update_states: List[UpdateDebugStateDict] = []
		debug_column_names: List[str] = []
		interest_input_dict = CalculateInterestInputDict(
			loan=loan,
			invoice=invoice,
			threshold_info=threshold_info
		)

		financing_day_limit = None
		date_to_result = {}

		errors_list = []

		if payment_to_include and not payment_to_include.get('deposit_date'):
			return None, [errors.Error('Deposit date missing from payment to include')]

		if payment_to_include and not payment_to_include.get('settlement_date'):
			return None, [errors.Error('Settlement date missing from payment to include')]

		def _get_calculate_result_dict(
			result_today: datetime.date, # "Today" date to use in the result dict.
		) -> CalculateResultDict:
			# If you haven't gone through the transaction's settlement days, but you did include
			# them because they were deposited, interest and fees may go negative for those
			# clearance days, but then when those settlement days happen, the fees and interest
			# balance out.

			should_close_loan = False
			outstanding_principal = _format_output_value(balances['outstanding_principal'], should_round_output)
			outstanding_principal_for_interest = _format_output_value(balances['outstanding_principal_for_interest'], should_round_output)
			outstanding_interest = _format_output_value(balances['outstanding_interest'], should_round_output)
			outstanding_fees = _format_output_value(balances['outstanding_fees'], should_round_output)

			accounting_outstanding_principal = _format_output_value(balances['accounting_outstanding_principal'], should_round_output)
			accounting_outstanding_interest = _format_output_value(balances['accounting_outstanding_interest'], should_round_output)
			accounting_outstanding_late_fees = _format_output_value(balances['accounting_outstanding_late_fees'], should_round_output)
			accounting_interest_accrued_today = 0.0 if company_settings['interest_end_date'] is not None and \
				result_today > company_settings['interest_end_date'] else interest_accrued_today
			accounting_late_fees_accrued_today = 0.0 if company_settings['late_fees_end_date'] is not None and \
				result_today > company_settings['late_fees_end_date'] else fees_accrued_today

			if not loan['closed_at'] and balances['has_been_funded']:
				# If the loan hasn't been closed yet and is funded, then
				# check whether it should be closed.
				# If it already has been closed, then no need to close it again.
				# If it's not funded yet, then we shouldnt close it out yet.
				should_close_loan = payment_util.should_close_loan(
					new_outstanding_principal=outstanding_principal,
					new_outstanding_interest=outstanding_interest,
					new_outstanding_fees=outstanding_fees,
					day_last_repayment_settles=balances['day_last_repayment_settles'],
					cur_date=result_today
				)

			report_repayment_date = balances['repayment_date']
			financing_period = None

			# Financing period is complete on date loan is closed.
			is_financing_period_complete = loan['closed_at'] or should_close_loan

			if is_financing_period_complete:
				if not report_repayment_date and payment_to_include:
					report_repayment_date = payment_to_include['settlement_date']

				# If there is a repayment date, calculate the financing period for this closed loan.
				# Note: there may not be a repayment date if the loan was closed via adjustments.
				if report_repayment_date:
					financing_period = date_util.number_days_between_dates(
						report_repayment_date,
						loan['origination_date'],
						inclusive_later_date=True,
					)

				days_overdue = 0
			else:
				# Since loan is not closed, financing period is not complete.
				financing_period = date_util.number_days_between_dates(
					max(result_today, report_repayment_date) if report_repayment_date else result_today,
					loan['origination_date'],
					inclusive_later_date=True,
				)

				days_overdue = date_util.number_days_between_dates(
					result_today, 
					loan['adjusted_maturity_date'],
				)
				days_overdue = days_overdue if days_overdue else 0

			adjusted_maturity_date = loan['adjusted_maturity_date']
			l = LoanUpdateDict(
				loan_id=loan['id'],
				adjusted_maturity_date=loan['adjusted_maturity_date'],
				outstanding_principal=outstanding_principal,
				outstanding_principal_for_interest=outstanding_principal_for_interest,
				outstanding_principal_past_due=outstanding_principal if today > adjusted_maturity_date else 0.0,
				outstanding_interest=outstanding_interest,
				outstanding_fees=outstanding_fees,
				interest_paid_daily_adjustment=0.0, # Will be filled in later if necessary
				fees_paid_daily_adjustment=0.0, # Will be filled in later if necessary
				amount_to_pay_interest_on=_format_output_value(amount_to_pay_interest_on, should_round_output),
				interest_accrued_today=_format_output_value(interest_accrued_today, should_round_output),
				fees_accrued_today=_format_output_value(fees_accrued_today, should_round_output),
				should_close_loan=should_close_loan,
				repayment_date=report_repayment_date,
				day_last_repayment_settles=balances['day_last_repayment_settles'],
				financing_period=financing_period,
				financing_day_limit=financing_day_limit,
				total_principal_paid=_format_output_value(balances['total_principal_paid'], should_round_output),
				total_interest_paid=_format_output_value(balances['total_interest_paid'], should_round_output),
				total_fees_paid=_format_output_value(balances['total_fees_paid'], should_round_output),
				days_overdue=days_overdue,
				accounting_outstanding_principal=accounting_outstanding_principal,
				accounting_outstanding_interest=accounting_outstanding_interest,
				accounting_outstanding_late_fees=accounting_outstanding_late_fees,
				accounting_interest_accrued_today=accounting_interest_accrued_today,
				accounting_late_fees_accrued_today=accounting_late_fees_accrued_today,
			)

			return CalculateResultDict(
				payment_effect=payment_effect_dict,
				loan_update=l,
				debug_info=LoanUpdateDebugInfoDict(
					column_names=debug_column_names,
					update_states=debug_update_states
				)
			)

		# Run through all the days and compute the balances
		if loan['is_frozen'] and not loan['closed_at']:
			logging.warn(f'Loan {loan["identifier"]} ({loan["id"]}) is frozen but closed_at is None')

		txs_helper, err = TransactionsHelper.build(augmented_transactions, payment_to_include, today)
		if err:
			return None, [err]
		
		last_tx_settlement_date = txs_helper.last_tx_settlement_date
		if last_tx_settlement_date and last_tx_settlement_date > today:
			calculate_up_to_date = last_tx_settlement_date
		else:
			calculate_up_to_date = today

		balances['day_last_repayment_settles'] = last_tx_settlement_date

		if today < loan['origination_date']:
			# No loan has been originated yet, so skip any calculations for it.
			days_out = 0
		else:
			# Once we've considered how these transactions were applied, here is the remaining amount
			# which hasn't been factored in yet based on how much you owe up to this particular day.
			days_out = date_util.num_calendar_days_passed(
				calculate_up_to_date,
				loan['origination_date'],
			)

		for i in range(days_out):
			cur_date = loan['origination_date'] + timedelta(days=i)

			# For frozen loans: if loan is closed, do not perform any calculations for this date.
			# TODO(warrenshen): apply the same logic for non-frozen loans.
			if loan['is_frozen'] and loan['closed_at'] and cur_date > loan['closed_at'].date():
				logging.error('WE SHOULD NEVER SEE CLOSED, FROZEN LOANS in loan_calculator in prod')
				continue

			cur_date_contract, err = self._contract_helper.get_contract(cur_date)
			if err:
				return None, [err]

			product_type, err = cur_date_contract.get_product_type()
			if err:
				return None, [err]

			if product_type != db_constants.ProductType.LINE_OF_CREDIT:
				financing_day_limit, err = cur_date_contract.get_contract_financing_terms()
				if err:
					return None, [err]

			# Check each transaction and the effect it had on this loan
			transactions_by_settlement_date = txs_helper.get_transactions_on_settlement_date(cur_date)

			# Advances count against principal on the settlement date (which happens to be
			# be the same as deposit date)

			_update_at_beginning_of_day(transactions_by_settlement_date, balances)
			

			interest_fee_info, err = _get_interest_and_fees_due_on_day(
				self._contract_helper,
				cur_date,
				interest_input_dict,
				balances=balances
			)
			if err:
				errors_list.append(err)
				continue

			interest_due_for_day = interest_fee_info['interest_due_for_day']
			fee_due_for_day = interest_fee_info['fee_due_for_day']

			# Update outstanding interest and fee state
			balances['outstanding_interest'] += interest_due_for_day
			balances['outstanding_fees'] += fee_due_for_day

			# Update accounting balances, in which balances are increased 
			# if customer is on happy path but are not increased if after 
			# the interest or late fees end dates.
			balances['accounting_outstanding_interest'] += interest_due_for_day if company_settings['interest_end_date'] is None or cur_date <= company_settings['interest_end_date'] else 0
			balances['accounting_outstanding_late_fees'] += fee_due_for_day if company_settings['late_fees_end_date'] is None or cur_date <= company_settings['late_fees_end_date'] else 0

			interest_accrued_today = interest_due_for_day
			fees_accrued_today = fee_due_for_day
			amount_to_pay_interest_on = interest_fee_info['amount_to_pay_interest_on']

			cur_contract_start_date, err = cur_date_contract.get_start_date()
			if err:
				errors_list.append(err)
				continue

			cur_contract_end_date, err = cur_date_contract.get_adjusted_end_date()
			if err:
				errors_list.append(err)
				continue

			self._fee_accumulator.accumulate(
				contract_start_date=cur_contract_start_date,
				contract_end_date=cur_contract_end_date,
				interest_for_day=interest_due_for_day,
				fees_for_day=fee_due_for_day,
				day=cur_date
			)

			if include_debug_info:
				debug_column_names = [
					'date',
					'outstanding_principal',
					'outstanding_principal_for_interest',
					'outstanding_interest', 
					'outstanding_fees',

					'amount_to_pay_interest_on',
					'interest_due_for_day',
					'fee_for_day',
					'interest_rate',
					'fee_multiplier',
				]
				debug_row_info: List[Union[str, int, float]] = [
					date_util.date_to_db_str(cur_date),
					balances['outstanding_principal'],
					balances['outstanding_principal_for_interest'],
					balances['outstanding_interest'],
					balances['outstanding_fees'],

					interest_fee_info['amount_to_pay_interest_on'],
					interest_fee_info['interest_due_for_day'],
					interest_fee_info['fee_due_for_day'],
					interest_fee_info['interest_rate_used'],
					interest_fee_info['fee_multiplier'],
				]
				debug_update_states.append(UpdateDebugStateDict(
					row_info=debug_row_info
				))

			# Apply repayment transactions at the "end of the day"

			transactions_by_deposit_date = txs_helper.get_transactions_on_deposit_date(cur_date)
			_update_end_of_day_repayment_deposits(transactions_by_deposit_date, balances, cur_date, loan)
			
			if payment_to_include and payment_to_include['deposit_date'] == cur_date:
				# Incorporate this payment and snapshot what the state of the balance was
				# before this payment was incorporated
				loan_state_before_payment = LoanFinancialStateDict(
					outstanding_principal=balances['outstanding_principal'],
					outstanding_principal_for_interest=balances['outstanding_principal_for_interest'],
					outstanding_interest=balances['outstanding_interest'],
					outstanding_fees=balances['outstanding_fees'],
					amount_to_pay_interest_on=amount_to_pay_interest_on
				)
				inner_balances = cast(CalculatorBalances, copy.deepcopy(cast(Dict, balances)))
				
				# Calculate the fees and interest that will accrue in between the deposit
				# and settlement date.
				
				additional_interest, additional_fees, inner_has_err = _get_additional_interest_and_fees_for_repayment_effect(
					self._contract_helper, cur_date, payment_to_include, 
					inner_balances,
					txs_helper=txs_helper, 
					interest_input_dict=interest_input_dict
				) 

				if inner_has_err:
					errors_list.append(inner_has_err)
					continue

				# The purpose of loan_update_before_payment is to show the user what the state of the loan
				# would be on the settlement_date had they not paid for anything.
				#
				# So we need to include these additional outstanding balances which may have accrued
				# between the payment_date and settlement_date
				#
				# To calculate the interest due is easy, since we just add the interest
				# accrued due to the settlement days
				loan_state_before_payment['outstanding_interest'] += additional_interest

				#
				# This block calculates the fees which is a bit more complicated.
				#
				# Basically, we need to determine if the user has enough remaining custom_amount
				# to pay off the principal (given they have outstanding interest and fees) too.
				#
				# If they do have enough money to pay off the principal, then no additional
				# fees will accrue due to the settlement days. If they dont have enough money
				# to pay off the entire principal, then we charge them the full set of
				# additional fees due to the settlement days being included.
				temp_transaction = _determine_transaction(
					loan, loan_state_before_payment, payment_to_include
				)

				has_enough_to_pay_principal_by_maturity_date = number_util.float_eq(
					number_util.round_currency(loan_state_before_payment['outstanding_principal']),
					number_util.round_currency(temp_transaction['to_principal'])
				) and cur_date <= loan['adjusted_maturity_date']

				if has_enough_to_pay_principal_by_maturity_date:
					pass
				else:
					# If they dont have enough money to pay off the principal and interest
					# by the maturity date (which ends up creating a partial payment)
					# means they owe the additional fees accrued due to the settlement days
					loan_state_before_payment['outstanding_fees'] += additional_fees


				inserted_repayment_transaction = _determine_transaction(
					loan, loan_state_before_payment, payment_to_include
				)

				_reduce_custom_amount_remaining(inserted_repayment_transaction, payment_to_include)

				balances['outstanding_principal'] -= inserted_repayment_transaction['to_principal']
				balances['outstanding_interest'] -= inserted_repayment_transaction['to_interest']
				balances['outstanding_fees'] -= inserted_repayment_transaction['to_fees']

				balances['accounting_outstanding_interest'] -= inserted_repayment_transaction['to_interest']
				balances['accounting_outstanding_late_fees'] -= inserted_repayment_transaction['to_fees']

				if (
					number_util.float_lte(number_util.round_currency(balances['outstanding_principal']), 0.0) and
					cur_date <= loan['adjusted_maturity_date']
				):
					balances['loan_paid_by_maturity_date'] = True

				payment_effect_dict = PaymentEffectDict(
					loan_state_before_payment=loan_state_before_payment,
					transaction=inserted_repayment_transaction
				)

			_update_end_of_day_repayment_settlements(
				transactions_by_settlement_date,
				balances
			)

			if payment_to_include and payment_to_include['settlement_date'] == cur_date:
				# Since it is the settlement date, whatever got applied to principal on this date
				# reduces their outstanding_principal_for_interest
				if not inserted_repayment_transaction:
					errors_list.append(errors.Error(
						f'There is no inserted repayment transaction for loan {loan["identifier"]} ({loan["id"]}) on {date_util.date_to_db_str(cur_date)}. An error must have occurred while determining details about the repayment on the deposit date. Likely you chose a deposit date outside the range of loan origination date and maturity date.'))
					continue

				balances['outstanding_principal_for_interest'] -= inserted_repayment_transaction['to_principal']
				balances['amount_paid_back_on_loan'] += inserted_repayment_transaction['amount']

			date_to_result[cur_date] = _get_calculate_result_dict(cur_date)

		if errors_list:
			return None, errors_list

		if today not in date_to_result:
			# If we haven't added any results yet, just add a dummy one here.
			date_to_result[today] = _get_calculate_result_dict(today)

		success, err = _perform_daily_interest_and_fees_adjustment(self._fee_accumulator, txs_helper, date_to_result)
		if err:
			return None, [err]

		return date_to_result[today], None

	def calculate_loan_balance(
		self,
		threshold_info: ThresholdInfoDict,
		loan: models.LoanDict,
		invoice: models.InvoiceDict, # Filled in if this loan is related to invoice financing
		company_settings: models.CompanySettingsDict,
		augmented_transactions: List[models.AugmentedTransactionDict],
		today: datetime.date,
		should_round_output: bool = True,
		payment_to_include: IncludedPaymentDict = None,
		include_debug_info: bool = False,
		now_for_test: datetime.datetime = None,
	) -> Tuple[CalculateResultDict, List[errors.Error]]:

		calculate_result, err = self._calculate_loan_balance_internal(
			threshold_info=threshold_info,
			loan=loan,
			invoice=invoice,
			company_settings=company_settings,
			augmented_transactions=augmented_transactions,
			today=today,
			should_round_output=should_round_output,
			payment_to_include=payment_to_include,
			include_debug_info=include_debug_info,
			now_for_test=now_for_test
		)
		if err:
			return None, err

		return calculate_result, None
