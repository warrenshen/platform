"""
	A loan calculator is an object that takes in transactions and a report date,
	and then calculates the outstanding principal, interest and fees that will
	be associated with this loan at a particular date.
"""
import datetime
import logging
from collections import OrderedDict
from datetime import timedelta
from typing import Dict, List, NamedTuple, Tuple, Union

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
	'outstanding_fees': float
})

LoanUpdateDict = TypedDict('LoanUpdateDict', {
	'loan_id': str,
	'adjusted_maturity_date': datetime.date,
	'outstanding_principal': float,
	'outstanding_principal_for_interest': float,
	'outstanding_interest': float,
	'outstanding_fees': float,
	'interest_accrued_today': float,
	'should_close_loan': bool
})

UpdateDebugStateDict = TypedDict('UpdateDebugStateDict', {
	'row_info': List[Union[str, int, float]]
})

LoanUpdateDebugInfoDict = TypedDict('LoanUpdateDebugInfoDict', {
	'column_names': List[str],
	'update_states': List[UpdateDebugStateDict]
})

ThresholdInfoDict = TypedDict('ThresholdInfoDict', {
	'day_threshold_met': datetime.date
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

def _get_transactions_on_deposit_date(
	cur_date: datetime.date, augmented_transactions: List[models.AugmentedTransactionDict]) -> List[models.AugmentedTransactionDict]:
	txs_on_date = []
	for tx in augmented_transactions:
		if tx['payment']['deposit_date'] == cur_date:
			txs_on_date.append(tx)

	return txs_on_date

def _get_transactions_on_settlement_date(
	cur_date: datetime.date, augmented_transactions: List[models.AugmentedTransactionDict]) -> List[models.AugmentedTransactionDict]:
	txs_on_date = []
	for tx in augmented_transactions:
		# Note: we could use tx['payment']['settlement_date'] here alternatively.
		if tx['transaction']['effective_date'] == cur_date:
			txs_on_date.append(tx)

	return txs_on_date

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

InterestFeeInfoDict = TypedDict('InterestFeeInfoDict', {
	'amount_to_pay_interest_on': float,
	'interest_due_for_day': float,
	'interest_rate_used': float,
	'fee_due_for_day': float,
	'fee_multiplier': float
})

class LoanCalculator(object):
	"""
		Helps calculate and summarize the history of the loan with respect to
		how the interest and fees are accumulated.
	"""
	def __init__(self, contract_helper: contract_util.ContractHelper, fee_accumulator: fee_util.FeeAccumulator) -> None:
		self._contract_helper = contract_helper
		self._fee_accumulator = fee_accumulator
		# For summarization
		self._balance_ranges: List[BalanceRange] = []

	def _note_today(
		self, cur_date: datetime.date, outstanding_principal: float, interest_rate: float, fee_multiplier: float) -> None:
		"""
		Give date ranges that a certain principal was in play, and the interest accrued on it being daily interest * num_days
		For that date range, also give what fees were accrued bucketed by when the accelerated payment kicked in.
		"""
		if not self._balance_ranges:
			# Initialize everything as this is the first call
			self._balance_ranges.append(BalanceRange(
				start_date=cur_date,
				outstanding_principal=outstanding_principal
			))

		cur_balance_range = self._balance_ranges[-1]
		prev_outstanding_balance = cur_balance_range.outstanding_principal
		balance_changed = not number_util.float_eq(outstanding_principal, prev_outstanding_balance)

		if balance_changed:
			# Create a date range for how long the previous balance lasted.
			cur_balance_range.add_end_date(cur_date - timedelta(days=1))
			self._balance_ranges.append(BalanceRange(
				start_date=cur_date,
				outstanding_principal=outstanding_principal
			))

		# Always add the current interest and fees to the latest range.
		self._balance_ranges[-1].add_fee_info(interest_rate, fee_multiplier)

	def get_summary(self) -> str:
		lines = []
		for balance_range in self._balance_ranges:
			cur_lines = [
				'From {} to {}'.format(balance_range.start_date, balance_range.end_date),
				'Principal: {}'.format(balance_range.outstanding_principal),
				'Interest_rates ({}): {}'.format(len(balance_range.interest_rates), balance_range.interest_rates),
				'Fees ({}): {}'.format(len(balance_range.fee_multipliers), balance_range.fee_multipliers),
				''
			]
			lines.extend(cur_lines)

		return '\n'.join(lines)

	def _get_interest_and_fees_due_on_day(
			self,
			cur_date: datetime.date,
			loan: models.LoanDict,
			invoice: models.InvoiceDict,
			threshold_info: ThresholdInfoDict,
			outstanding_principal: float,
			outstanding_principal_for_interest: float,
			amount_paid_back_on_loan: float,
			loan_paid_by_maturity_date: bool
		) -> Tuple[InterestFeeInfoDict, errors.Error]:
			cur_contract, err = self._contract_helper.get_contract(cur_date)
			if err:
				return None, err

			# Interest
			cur_interest_rate, err = cur_contract.get_interest_rate()
			if err:
				return None, err

			cur_contract_start_date, err = cur_contract.get_start_date()
			if err:
				return None, err

			product_type, err = cur_contract.get_product_type()
			if err:
				return None, err

			# Fees
			fees_due_today = 0.0
			fee_multiplier = 0.0
			#print('Cur DATE {} Outstanding principal {} Principal for interest {}'.format(
			#		cur_date, outstanding_principal, outstanding_principal_for_interest))
			if cur_date > loan['adjusted_maturity_date']:
				days_past_due = (cur_date - loan['adjusted_maturity_date']).days

				fee_multiplier, err = cur_contract.get_fee_multiplier(days_past_due=days_past_due)
				if err:
					return None, err
			else:
				# Fees do not accrue on the day of the maturity date
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
					reduced_interest_rate, err = cur_contract.get_discounted_interest_rate_due_to_factoring_fee()
					if err:
						return None, err

					interest_rate_used = reduced_interest_rate

			is_invoice_financing = product_type == db_constants.ProductType.INVOICE_FINANCING
			amount_to_pay_interest_on = None

			if is_invoice_financing:
				if not invoice:
					return None, errors.Error('No invoice found associated with this loan, could not compute any financial details')

				if number_util.is_currency_zero(outstanding_principal_for_interest):
					# If loan is fully paid, there is no amount to pay interest on.
					amount_to_pay_interest_on = 0.0
				else:
					# If loan is not fully paid, amount to pay interest on is based on invoice subtotal and amount paid back.
					amount_to_pay_interest_on = max(0.0, invoice['subtotal_amount'] - amount_paid_back_on_loan)
			else:
				amount_to_pay_interest_on = outstanding_principal_for_interest

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
			fee_due_for_day = 0.0 if loan_paid_by_maturity_date else fee_multiplier * interest_due_for_day

			return InterestFeeInfoDict(
				amount_to_pay_interest_on=amount_to_pay_interest_on,
				interest_due_for_day=interest_due_for_day,
				interest_rate_used=interest_rate_used,
				fee_due_for_day=fee_due_for_day,
				fee_multiplier=fee_multiplier
			), None

	def calculate_loan_balance(
		self,
		threshold_info: ThresholdInfoDict,
		loan: models.LoanDict,
		invoice: models.InvoiceDict, # Filled in if this loan is related to invoice financing
		augmented_transactions: List[models.AugmentedTransactionDict],
		today: datetime.date,
		should_round_output: bool = True,
		payment_to_include: IncludedPaymentDict = None,
		include_debug_info: bool = False
	) -> Tuple[CalculateResultDict, List[errors.Error]]:
		# Replay the history of the loan and all the expenses that are due as a result.
		# Heres what you owe based on the transaction history applied to your loan.

		if not loan['origination_date']:
			return None, [errors.Error('Could not determine loan balance for loan_id={} because it has no origination_date set'.format(
				loan['id']))]

		calculate_up_to_date = today

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

		# For each day between today and the origination date, you need to calculate interest and fees
		# and consider transactions along the way.
		outstanding_principal = 0.0 # The customer sees this as their outstanding principal
		outstanding_principal_for_interest = 0.0 # Amount of principal used for calculating interest and fees off of
		amount_to_pay_interest_on = 0.0 # The exact amount on a given day that the person paid interest on
		outstanding_interest = 0.0
		outstanding_fees = 0.0
		interest_accrued_today = 0.0
		has_been_funded = False
		amount_paid_back_on_loan = 0.0
		loan_paid_by_maturity_date= False

		# Variables used to calculate the repayment effect
		payment_effect_dict = None # Only filled in when payment_to_include is incorporated
		inserted_repayment_transaction = None # A transaction which would occur, if the user did indeed include this payment

		errors_list = []
		todays_contract, err = self._contract_helper.get_contract(today)
		if err:
			return None, [err]

		todays_contract_start_date, err = todays_contract.get_start_date()
		if err:
			return None, [err]

		todays_contract_end_date, err = todays_contract.get_adjusted_end_date()
		if err:
			return None, [err]

		if payment_to_include and not payment_to_include.get('deposit_date'):
			return None, [errors.Error('Deposit date missing from payment to include')]

		if payment_to_include and not payment_to_include.get('settlement_date'):
			return None, [errors.Error('Settlement date missing from payment to include')]

		def _reduce_custom_amount_remaining(tx: TransactionInputDict) -> None:
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

		debug_update_states: List[UpdateDebugStateDict] = []
		debug_column_names: List[str] = []

		for i in range(days_out):
			cur_date = loan['origination_date'] + timedelta(days=i)
			# Check each transaction and the effect it had on this loan
			transactions_on_settlement_date = _get_transactions_on_settlement_date(cur_date, augmented_transactions)

			# Advances count against principal on the settlement date (which happens to be
			# be the same as deposit date)

			for aug_tx in transactions_on_settlement_date:
				tx = aug_tx['transaction']
				is_advance_or_adjustment = payment_util.is_advance(tx) or payment_util.is_adjustment(tx)
				if is_advance_or_adjustment:
					# Adjustments and advances both get applied at the beginning of the day
					outstanding_principal += tx['to_principal']
					outstanding_principal_for_interest += tx['to_principal']
					outstanding_interest += tx['to_interest']
					outstanding_fees += tx['to_fees']

				if payment_util.is_advance(tx):
					has_been_funded = True

			interest_fee_info, err = self._get_interest_and_fees_due_on_day(
				cur_date,
				loan,
				invoice,
				threshold_info,
				outstanding_principal=outstanding_principal,
				outstanding_principal_for_interest=outstanding_principal_for_interest,
				amount_paid_back_on_loan=amount_paid_back_on_loan,
				loan_paid_by_maturity_date=loan_paid_by_maturity_date
			)
			if err:
				errors_list.append(err)
				continue

			interest_due_for_day = interest_fee_info['interest_due_for_day']
			fee_due_for_day = interest_fee_info['fee_due_for_day']

			# Update outstanding interest and fee state
			outstanding_interest += interest_due_for_day
			outstanding_fees += fee_due_for_day

			if cur_date == today:
				interest_accrued_today = interest_due_for_day
				amount_to_pay_interest_on = interest_fee_info['amount_to_pay_interest_on']

			self._fee_accumulator.accumulate(
				todays_contract_start_date=todays_contract_start_date,
				todays_contract_end_date=todays_contract_end_date,
				interest_for_day=interest_due_for_day,
				day=cur_date
			)

			self._note_today(
				cur_date=cur_date,
				outstanding_principal=outstanding_principal,
				interest_rate=interest_fee_info['interest_rate_used'],
				fee_multiplier=interest_fee_info['fee_multiplier']
			)

			if include_debug_info:
				debug_column_names = [
					'date', 
					'outstanding_principal', 
					'outstanding_principal_for_interest',
					'outstanding_interest', 
					'outstanding_fees',

					'interest_due_for_day',
					'fee_for_day',
					'interest_rate',
					'fee_multiplier',
				]
				debug_row_info: List[Union[str, int, float]] = [
					date_util.date_to_db_str(cur_date),
					outstanding_principal,
					outstanding_principal_for_interest,
					outstanding_interest,
					outstanding_fees,

					interest_due_for_day,
					fee_due_for_day,
					interest_fee_info['interest_rate_used'],
					interest_fee_info['fee_multiplier'],
				]
				debug_update_states.append(UpdateDebugStateDict(
					row_info=debug_row_info
				))

			# Apply repayment transactions at the "end of the day"

			transactions_on_deposit_date = _get_transactions_on_deposit_date(cur_date, augmented_transactions)
			for aug_tx in transactions_on_deposit_date:
				tx = aug_tx['transaction']
				if payment_util.is_repayment(tx):
					# The outstanding principal for a payment gets reduced on the deposit date
					outstanding_principal -= tx['to_principal']
					outstanding_interest -= tx['to_interest']
					outstanding_fees -= tx['to_fees']
					if (
						number_util.float_lte(number_util.round_currency(outstanding_principal), 0.0) and 
						cur_date <= loan['adjusted_maturity_date']
					):
						loan_paid_by_maturity_date = True

			if payment_to_include and payment_to_include['deposit_date'] == cur_date:
				# Incorporate this payment and snapshot what the state of the balance was
				# before this payment was incorporated
				loan_state_before_payment = LoanFinancialStateDict(
					outstanding_principal=outstanding_principal,
					outstanding_principal_for_interest=outstanding_principal_for_interest,
					outstanding_interest=outstanding_interest,
					outstanding_fees=outstanding_fees
				)

				# Calculate the fees and interest that will accrue in between the deposit
				# and settlement date.
				inner_cur_date = cur_date
				inner_end_date = payment_to_include['settlement_date']
				additional_interest = 0.0
				additional_fees = 0.0
				inner_has_err = None

				while inner_cur_date < inner_end_date:
					inner_cur_date = inner_cur_date + timedelta(days=1)

					inner_interest_fee_info, err = self._get_interest_and_fees_due_on_day(
						inner_cur_date,
						loan,
						invoice,
						threshold_info,
						outstanding_principal=outstanding_principal,
						outstanding_principal_for_interest=outstanding_principal_for_interest,
						amount_paid_back_on_loan=amount_paid_back_on_loan,
						loan_paid_by_maturity_date=loan_paid_by_maturity_date
					)
					if err:
						inner_has_err = err
						break

					additional_interest += inner_interest_fee_info['interest_due_for_day']
					additional_fees += inner_interest_fee_info['fee_due_for_day']

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

				_reduce_custom_amount_remaining(inserted_repayment_transaction)

				# Only interest and fees get paid on this date because we need to wait until the
				# settlement date to pay for interest and fees, and then pay off whatever we can
				# to the principal.
				outstanding_principal -= inserted_repayment_transaction['to_principal']
				outstanding_interest -= inserted_repayment_transaction['to_interest']
				outstanding_fees -= inserted_repayment_transaction['to_fees']
				if (
					number_util.float_lte(number_util.round_currency(outstanding_principal), 0.0) and
					cur_date <= loan['adjusted_maturity_date']
				):
					loan_paid_by_maturity_date = True

				payment_effect_dict = PaymentEffectDict(
					loan_state_before_payment=loan_state_before_payment,
					transaction=inserted_repayment_transaction
				)

			for aug_tx in transactions_on_settlement_date:
				tx = aug_tx['transaction']
				if payment_util.is_repayment(tx):
					# The principal for interest calculations gets paid off on the settlement date
					outstanding_principal_for_interest -= tx['to_principal']
					amount_paid_back_on_loan += tx['amount']

				# You also want to incorporate the interest and fees that will accumulate on the settlement date,

			if payment_to_include and payment_to_include['settlement_date'] == cur_date:
				# Since it is the settlement date, whatever got applied to principal on this date
				# reduces their outstanding_principal_for_interest
				if not inserted_repayment_transaction:
					errors_list.append(errors.Error(
						'There is no inserted repayment transaction, therefore an error must have occurred while determining details about the repayment on the deposit date. Likely you chose a deposit date outside the range of when the loan originated or matured.'))
					continue

				outstanding_principal_for_interest -= inserted_repayment_transaction['to_principal']
				amount_paid_back_on_loan += inserted_repayment_transaction['amount']

		if errors_list:
			return None, errors_list

		# If you haven't gone through the transaction's settlement days, but you did include
		# them because they were deposited, interest and fees may go negative for those
		# clearance days, but then when those settlement days happen, the fees and interest
		# balance out.

		# Note the final date that this report was run.
		if self._balance_ranges:
			self._balance_ranges[-1].add_end_date(cur_date)

		# NOTE: This will be handy later when we want to show to the user how
		# we calculated all the interest and fees.
		# print(f'Identifier: {loan["identifier"]}')
		# print(self.get_summary())

		l = LoanUpdateDict(
			loan_id=loan['id'],
			adjusted_maturity_date=loan['adjusted_maturity_date'],
			outstanding_principal=_format_output_value(outstanding_principal, should_round_output),
			outstanding_principal_for_interest=_format_output_value(amount_to_pay_interest_on, should_round_output),
			outstanding_interest=_format_output_value(outstanding_interest, should_round_output),
			outstanding_fees=_format_output_value(outstanding_fees, should_round_output),
			interest_accrued_today=_format_output_value(interest_accrued_today, should_round_output),
			should_close_loan=False,
		)

		if not loan['closed_at'] and has_been_funded:
			# If the loan hasn't been closed yet and is funded, then
			# check whether it should be closed.
			# If it already has been closed, then no need to close it again.
			# If it's not funded yet, then we shouldnt close it out yet.
			l['should_close_loan'] = payment_util.should_close_loan(
				new_outstanding_principal=l['outstanding_principal'],
				new_outstanding_interest=l['outstanding_interest'],
				new_outstanding_fees=l['outstanding_fees']
			)

		return CalculateResultDict(
			payment_effect=payment_effect_dict,
			loan_update=l,
			debug_info=LoanUpdateDebugInfoDict(
				column_names=debug_column_names,
				update_states=debug_update_states
			)
		), None
