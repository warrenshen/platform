"""
	A loan calculator is an object that takes in transactions and a report date,
	and then calculates the outstanding principal, interest and fees that will
	be associated with this loan at a particular date.
"""
import datetime
import logging
from collections import OrderedDict
from datetime import timedelta
from typing import Dict, List, NamedTuple, Tuple

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.finance import contract_util, number_util
from bespoke.finance.loans import fee_util
from bespoke.finance.payments import payment_util
from bespoke.finance.types import finance_types
from mypy_extensions import TypedDict

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
	'settlement_date': datetime.date
})

TransactionInputDict = TypedDict('TransactionInputDict', {
	'amount': float,
	'to_principal': float,
	'to_interest': float,
	'to_fees': float
})

PaymentEffectDict = TypedDict('PaymentEffectDict', {
	'loan_update_before_payment': LoanUpdateDict,
	'transaction': TransactionInputDict
})

CalculateResultDict = TypedDict('CalculateResultDict', {
	'payment_effect': PaymentEffectDict,
	'loan_update': LoanUpdateDict
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

def _apply_to(cur_loan_update: LoanUpdateDict, category: str, amount_left: float) -> Tuple[float, float]:
	if category == 'principal':
		outstanding_amount = cur_loan_update['outstanding_principal']
	elif category == 'interest':
		outstanding_amount = cur_loan_update['outstanding_interest']
	elif category == 'fees':
		outstanding_amount = cur_loan_update['outstanding_fees']
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
	loan: models.LoanDict, cur_loan_update: LoanUpdateDict, payment_to_include: IncludedPaymentDict) -> TransactionInputDict:
	# loan_update is the current state of the loan at the time you can
	# apply the user's desired payment

	# Determine what transaction gets created given the payment options provided
	# Paying off interest and fees takes preference over principal.
	payment_option = payment_to_include['option']

	def _pay_in_full() -> TransactionInputDict:
		current_amount = payment_util.sum([
			cur_loan_update['outstanding_principal'],
			cur_loan_update['outstanding_interest'],
			cur_loan_update['outstanding_fees']
		])

		return TransactionInputDict(
				amount=current_amount,
				to_principal=cur_loan_update['outstanding_principal'],
				to_interest=cur_loan_update['outstanding_interest'],
				to_fees=cur_loan_update['outstanding_fees'],
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
		amount_left, amount_used_interest = _apply_to(cur_loan_update, 'interest', amount_left)
		amount_left, amount_used_fees = _apply_to(cur_loan_update, 'fees', amount_left)
		amount_left, amount_used_principal = _apply_to(cur_loan_update, 'principal', amount_left)

		return TransactionInputDict(
				amount=amount_used_fees + amount_used_interest + amount_used_principal,
				to_principal=amount_used_principal,
				to_interest=amount_used_interest,
				to_fees=amount_used_fees,
		)
	elif payment_option == payment_util.RepaymentOption.CUSTOM_AMOUNT_FOR_SETTLING_LOC:

		amount_to_principal_left = payment_to_include['custom_amount_split']['to_principal']
		amount_to_interest_left = payment_to_include['custom_amount_split']['to_interest']

		amount_to_interest_left, amount_used_interest = _apply_to(cur_loan_update, 'interest', amount_to_interest_left)
		amount_to_interest_left, amount_used_fees = _apply_to(cur_loan_update, 'fees', amount_to_interest_left)
		amount_to_principal_left, amount_used_principal = _apply_to(cur_loan_update, 'principal', amount_to_principal_left)

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

		amount_to_interest_left, amount_used_interest = _apply_to(cur_loan_update, 'interest', amount_to_interest_left)
		amount_to_fees_left, amount_used_fees = _apply_to(cur_loan_update, 'fees', amount_to_fees_left)
		amount_to_principal_left, amount_used_principal = _apply_to(cur_loan_update, 'principal', amount_to_principal_left)

		return TransactionInputDict(
				amount=amount_used_fees + amount_used_interest + amount_used_principal,
				to_principal=amount_used_principal,
				to_interest=amount_used_interest,
				to_fees=amount_used_fees,
		)

	raise errors.Error('Invalid payment option provided {}'.format(payment_option))

def _format_output_value(value: float, should_round: bool, is_final_output: bool) -> float:
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
	if not is_final_output:
		# If we literally just want the number, and it's not used for the final state
		# of the loan, then just return the raw float value.
		return value

	if number_util.round_currency(value) == 0.0:
		return 0.0
	elif should_round:
		return number_util.round_currency(value)
	else:
		return value

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

	def calculate_loan_balance(
		self,
		threshold_info: ThresholdInfoDict,
		loan: models.LoanDict,
		augmented_transactions: List[models.AugmentedTransactionDict],
		today: datetime.date,
		should_round_output: bool = True,
		payment_to_include: IncludedPaymentDict = None
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
		outstanding_interest = 0.0
		outstanding_fees = 0.0
		interest_accrued_today = 0.0
		has_been_funded = False

		# Variables used to calculate the repayment effect
		payment_effect_dict = None # Only filled in when payment_to_include is incorporated
		inserted_repayment_transaction = None # A transaction which would occur, if the user did indeed include this payment
		final_repayment_transaction = None # The final transaction details to pay for the remaining interest and fees that accumulate between the deposit and settlement date
		additional_principal_after_repayment = 0.0
		additional_interest_after_repayment = 0.0
		additional_fees_after_repayment = 0.0

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

		def _get_loan_update_dict(should_round: bool, is_final_output: bool) -> LoanUpdateDict:
			l = LoanUpdateDict(
				loan_id=loan['id'],
				adjusted_maturity_date=loan['adjusted_maturity_date'],
				outstanding_principal=_format_output_value(outstanding_principal, should_round, is_final_output),
				outstanding_principal_for_interest=_format_output_value(outstanding_principal_for_interest, should_round, is_final_output),
				outstanding_interest=_format_output_value(outstanding_interest, should_round, is_final_output),
				outstanding_fees=_format_output_value(outstanding_fees, should_round, is_final_output),
				interest_accrued_today=_format_output_value(interest_accrued_today, should_round, is_final_output),
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

			return l

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

		def _is_after_repayment_deposit_date(cur_date: datetime.date) -> bool:
			return payment_to_include and cur_date > payment_to_include['deposit_date'] and cur_date <= payment_to_include['settlement_date']

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

				if _is_after_repayment_deposit_date(cur_date) and is_advance_or_adjustment:
					# Calculate any additional principal, fees, interest which may have accumulated
					# after the repayment in "calculate repayment effect" happened by the customer.
					additional_principal_after_repayment += tx['to_principal']
					additional_interest_after_repayment += tx['to_interest']
					additional_fees_after_repayment += tx['to_fees']

			cur_contract, err = self._contract_helper.get_contract(cur_date)
			if err:
				errors_list.append(err)
				continue

			# Interest
			cur_interest_rate, err = cur_contract.get_interest_rate()
			if err:
				errors_list.append(err)
				continue

			cur_contract_start_date, err = cur_contract.get_start_date()
			if err:
				errors_list.append(err)
				continue

			# Fees
			fees_due_today = 0.0
			fee_multiplier = 0.0
			#print('Cur DATE {} Outstanding principal {} Principal for interest {}'.format(
			#		cur_date, outstanding_principal, outstanding_principal_for_interest))
			if cur_date > loan['adjusted_maturity_date']:
				days_past_due = (cur_date - loan['adjusted_maturity_date']).days

				fee_multiplier, err = cur_contract.get_fee_multiplier(days_past_due=days_past_due)
				if err:
					errors_list.append(err)
					continue
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
						errors_list.append(err)
						continue

					interest_rate_used = reduced_interest_rate

			if outstanding_principal_for_interest == 0:
				interest_rate_used = 0.0
			elif outstanding_principal_for_interest < 0:
				logging.warn(f'Outstanding principal for interest ({outstanding_principal_for_interest}) is negative on {cur_date} for loan {loan["id"]}')
				interest_due_for_day = 0.0

			interest_due_for_day = interest_rate_used * outstanding_principal_for_interest
			outstanding_interest += interest_due_for_day

			# If the customer does not have any outstanding principal, even though their principal for
			# interest is accruing, dont charge any additional fees there.
			has_outstanding_principal = number_util.float_gt(round(outstanding_principal, 2), 0.0)
			fee_due_for_day = fee_multiplier * interest_due_for_day if has_outstanding_principal else 0.0
			outstanding_fees += fee_due_for_day

			if cur_date == today:
				interest_accrued_today = interest_due_for_day

			self._fee_accumulator.accumulate(
				todays_contract_start_date=todays_contract_start_date,
				todays_contract_end_date=todays_contract_end_date,
				interest_for_day=interest_due_for_day,
				day=cur_date
			)

			self._note_today(
				cur_date=cur_date,
				outstanding_principal=outstanding_principal,
				interest_rate=interest_rate_used,
				fee_multiplier=fee_multiplier
			)

			if _is_after_repayment_deposit_date(cur_date):
				# Calculate any additional fees or interest which may have accumulated
				# after the repayment in "calculate repayment effect" happened by the customer.
				additional_interest_after_repayment += interest_due_for_day
				additional_fees_after_repayment += fees_due_today

			# Apply repayment transactions at the "end of the day"

			transactions_on_deposit_date = _get_transactions_on_deposit_date(cur_date, augmented_transactions)
			for aug_tx in transactions_on_deposit_date:
				tx = aug_tx['transaction']
				if payment_util.is_repayment(tx):
					# The outstanding principal for a payment gets reduced on the deposit date
					outstanding_principal -= tx['to_principal']
					outstanding_interest -= tx['to_interest']
					outstanding_fees -= tx['to_fees']

			if payment_to_include and payment_to_include['deposit_date'] == cur_date:
				# Incorporate this payment and snapshot what the state of the balance was
				# before this payment was incorporated
				loan_update_before_payment = _get_loan_update_dict(should_round=False, is_final_output=False)
				inserted_repayment_transaction = _determine_transaction(
					loan, loan_update_before_payment, payment_to_include
				)

				_reduce_custom_amount_remaining(inserted_repayment_transaction)

				# The outstanding principal for a payment gets reduced on the payment date
				outstanding_principal -= inserted_repayment_transaction['to_principal']
				outstanding_interest -= inserted_repayment_transaction['to_interest']
				outstanding_fees -= inserted_repayment_transaction['to_fees']
				# 10/20
				# to_interest: 200.0
				# pay off: 10.0


			for aug_tx in transactions_on_settlement_date:
				tx = aug_tx['transaction']
				if payment_util.is_repayment(tx):
					# The principal for interest calculations gets paid off on the settlement date
					outstanding_principal_for_interest -= tx['to_principal']

			if payment_to_include and payment_to_include['settlement_date'] == cur_date:
				# On the settlement date we reduce the user's principal_for_interest
				outstanding_principal_for_interest -= inserted_repayment_transaction['to_principal']

				# Because some additional fees and interest may have accrued during these days
				# we also need to pay them off in the repayment effect logic.
				cur_loan_update = _get_loan_update_dict(should_round=False, is_final_output=False)
				cur_transaction = _determine_transaction(
					loan, cur_loan_update, payment_to_include
				)
				_reduce_custom_amount_remaining(cur_transaction)
				# You also want to incorporate the transaction details on the settlement date,
				# which will pay off any additional interest and fees that accumulated.
				outstanding_principal -= cur_transaction['to_principal']
				outstanding_interest -= cur_transaction['to_interest']
				outstanding_fees -= cur_transaction['to_fees']

				# The final transaction the user owes is the sum of what they owed on the deposit_date
				# plus any additional fees and interest come the settlement_date
				final_repayment_transaction = _sum_transactions(inserted_repayment_transaction, cur_transaction)

				# The purpose of loan_update_before_payment is to show the user what the state of the loan
				# would be on the settlement_date had they not paid for anything.
				#
				# So we need to include these additional outstanding balances which may have accrued
				# between the payment_date and settlement_date
				loan_update_before_payment['outstanding_principal'] += additional_principal_after_repayment
				loan_update_before_payment['outstanding_interest'] += additional_interest_after_repayment
				loan_update_before_payment['outstanding_fees'] += additional_fees_after_repayment

				payment_effect_dict = PaymentEffectDict(
					loan_update_before_payment=loan_update_before_payment,
					transaction=final_repayment_transaction
				)

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

		l = _get_loan_update_dict(should_round=should_round_output, is_final_output=True)

		return CalculateResultDict(
			payment_effect=payment_effect_dict,
			loan_update=l
		), None
