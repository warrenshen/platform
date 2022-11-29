import datetime
import logging
from decimal import Decimal
from typing import Any, Callable, Dict, List, Set, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models, model_types, queries
from bespoke.db.db_constants import FeatureFlagEnum, PaymentType, PaymentMethodEnum, PaymentOption, ProductType
from bespoke.db.model_types import PaymentItemsCoveredDict
from bespoke.finance import number_util
from bespoke.finance.loans.loan_calculator import (LoanUpdateDict)
from bespoke.finance.payments import repayment_util
from bespoke.finance.payments.payment_util import RepaymentOption
from bespoke.finance.reports import loan_balances
from sqlalchemy.orm.session import Session

product_types_with_autogenerate: List[str] = [
	ProductType.DISPENSARY_FINANCING,
	ProductType.INVENTORY_FINANCING,
]

def get_opt_in_customers(
	session: Session,
	customers: List[models.Company],
	supported_product_types: List[str],
	today_date: datetime.date
) -> Tuple[ Dict[str, models.Company], List[str], Dict[str, models.CompanySettings], errors.Error ]:
	all_customer_ids: List[str] = []
	for customer in customers:
		all_customer_ids.append(str(customer.id))

	financial_summaries, err = queries.get_financial_summaries_for_target_customers(
		session,
		all_customer_ids,
		today_date
	)
	if err:
		return None, None, None, err

	customer_settings, err = queries.get_company_settings_for_target_companies(
		session,
		all_customer_ids,
		allow_dummy = False,
	)
	if err:
		return None, None, None, err

	settings_lookup: Dict[str, models.CompanySettings] = {}
	for settings in customer_settings:
		settings_lookup[str(settings.company_id)] = settings

	filtered_customer_ids: List[str] = []
	for financial_summary in financial_summaries:
		company_id = str(financial_summary.company_id)
		supported_product_type = financial_summary.product_type in supported_product_types
		non_dummy = company_id in settings_lookup and (settings_lookup[company_id].is_dummy_account is False or \
			settings_lookup[company_id].is_dummy_account is None)

		feature_flags: Dict[str, bool] = cast(Dict[str, bool], settings_lookup[company_id].feature_flags_payload) if non_dummy else None
		customer_opt_in = settings_lookup[company_id].is_autogenerate_repayments_enabled if non_dummy else None
		bank_override = feature_flags[FeatureFlagEnum.OVERRIDE_REPAYMENT_AUTOGENERATION] \
			if feature_flags is not None and FeatureFlagEnum.OVERRIDE_REPAYMENT_AUTOGENERATION in feature_flags else False

		if supported_product_type and non_dummy and customer_opt_in and not bank_override:
			filtered_customer_ids.append(str(financial_summary.company_id))
		else:
			# Popping here just so unit tests match up for filtered case.
			# We need all the settings for the feature flag above, so
			# popping here saves us a second query with filtered_customer_ids
			# and keeps the unit test expectations consistent with other
			# values returned by this function.
			settings_lookup.pop(company_id, None)

	# Will be used to grab company info for the generated email rows
	filtered_customers: List[models.Company] = []
	for customer in customers:
		if str(customer.id) in filtered_customer_ids:
			filtered_customers.append(customer)

	customer_lookup: Dict[str, models.Company] = {}
	for customer in filtered_customers:
		customer_lookup[str(customer.id)] = customer

	return customer_lookup, filtered_customer_ids, settings_lookup, None

def get_opt_in_customer(
	session: Session,
	customer: models.Company,
	supported_product_types: List[str],
	today_date: datetime.date
) -> Tuple[ Dict[str, models.Company], List[str], Dict[str, models.CompanySettings], errors.Error ]:
	financial_summaries, err = queries.get_financial_summaries_for_target_customer(
		session,
		str(customer.id),
		today_date
	)
	if err:
		return None, None, None, err

	customer_settings, err = queries.get_company_settings_for_target_company(
		session,
		customer.id,
		allow_dummy = False,
	)
	if err:
		return None, None, None, err

	settings_lookup: Dict[str, models.CompanySettings] = {}
	settings_lookup[str(customer_settings.company_id)] = customer_settings

	filtered_customer_ids: List[str] = []
	for financial_summary in financial_summaries:
		company_id = str(financial_summary.company_id)
		supported_product_type = financial_summary.product_type in supported_product_types
		non_dummy = company_id in settings_lookup and (settings_lookup[company_id].is_dummy_account is False or \
			settings_lookup[company_id].is_dummy_account is None)

		feature_flags: Dict[str, bool] = cast(Dict[str, bool], settings_lookup[company_id].feature_flags_payload) if non_dummy else None
		customer_opt_in = settings_lookup[company_id].is_autogenerate_repayments_enabled if non_dummy else None
		bank_override = feature_flags[FeatureFlagEnum.OVERRIDE_REPAYMENT_AUTOGENERATION] \
			if feature_flags is not None and FeatureFlagEnum.OVERRIDE_REPAYMENT_AUTOGENERATION in feature_flags else False

		if supported_product_type and non_dummy and customer_opt_in and not bank_override:
			filtered_customer_ids.append(str(financial_summary.company_id))
		else:
			# Popping here just so unit tests match up for filtered case.
			# We need all the settings for the feature flag above, so
			# popping here saves us a second query with filtered_customer_ids
			# and keeps the unit test expectations consistent with other
			# values returned by this function.
			settings_lookup.pop(company_id, None)

	# Will be used to grab company info for the generated email rows
	filtered_customers: List[models.Company] = []
	if str(customer.id) in filtered_customer_ids:
		filtered_customers.append(customer)

	customer_lookup: Dict[str, models.Company] = {}
	for customer in filtered_customers:
		customer_lookup[str(customer.id)] = customer

	return customer_lookup, filtered_customer_ids, settings_lookup, None

def find_mature_loans_without_open_repayments(
	session: Session,
	customer_ids: List[str],
	today_date: datetime.date
) -> Tuple[ Dict[str, List[models.Loan]], errors.Error ]:
	# We are getting the nearest (future-facing) business day
	# to account for the payment arriving and settling -on- the
	# maturity date, not a day after, 
	#
	# We need the for loop to push forward 2 business days, one 
	# for the above and the other to account for the day needed
	# to process reverse draft aches. If we just set days = 2 in
	# a single call, it runs into issues with weekends and holidays
	target_maturity_date = date_util.add_biz_days(
		today_date, 
		days_to_add = 2
	)

	loans, err = queries.get_open_mature_loans_for_target_customers(
		session,
		customer_ids,
		target_maturity_date,
	)
	if err:
		return None, err
	
	# Gather up the loan ids so we can get the related
	# transactions in one query
	all_loan_ids: List[str] = []
	for loan in loans:
		all_loan_ids.append(str(loan.id))

	# Grab the open repayments so we can determine
	# which loans already have an open repayment
	open_repayments, err = queries.get_open_repayments_by_company_ids(
		session,
		customer_ids,
	)
	if err:
		return None, err
	
	all_loans_with_open_repayment_ids: Set[str] = set()
	for open_repayment in open_repayments:
		items_covered = cast(PaymentItemsCoveredDict, open_repayment.items_covered)
		loan_ids = items_covered["loan_ids"] if "loan_ids" in items_covered else []
		
		for loan_id in loan_ids:
			all_loans_with_open_repayment_ids.add(loan_id)
	
	# Now that we pulled the loan_ids from the items_covered
	# column of the open repayments, we can filter out those
	# loans as they already have a repayment in the pipe
	filtered_per_company_loans: Dict[str, List[models.Loan]] = {}
	for loan in loans:
		loan_id = str(loan.id)

		if loan_id in all_loans_with_open_repayment_ids:
			continue

		company_id = str(loan.company_id)
		if company_id not in filtered_per_company_loans:
			filtered_per_company_loans[company_id] = []
		filtered_per_company_loans[company_id].append(loan)

	return filtered_per_company_loans, None

def find_repayment_alert_start_date(
	alert_run_date: datetime.date,
) -> Tuple[ datetime.date, datetime.date, datetime.date, datetime.date, errors.Error]:
	# Recall that we are running this alert for the repayments that
	# will be generated *next* week. Since we're going to use the same
	# funtion as the actual auto-generation code to grab the loans, we
	# just need M-F, the other function will do the "check for the maturity
	# date on the next business day" logic for us.
	#
	# Since we're just alerting the customer for which repayments
	# will be generated in the next week, we don't need to worry about
	# getting 5 days worth of generation, just M-F. If a holiday or 
	# several holidays lowers the days checked, that is ultimately fine
	# because it will be picked up in the next alert
	#
	# We separate out the calculation for bumping into next week because
	# while the job is supposed to run on a Wednesday, we want it
	# flexible enough to work for any day M-F
	next_week = alert_run_date + datetime.timedelta(days = 7)
	weekday = next_week.weekday()
	diff_to_monday = 0 - weekday
	start_date = next_week + datetime.timedelta(days = diff_to_monday)
	end_date = start_date + datetime.timedelta(days = 4)

	start_maturity_date = date_util.get_nearest_business_day(
		start_date + datetime.timedelta(days = 1),
		preceeding = False,
	)
	end_maturity_date = date_util.get_nearest_business_day(
		end_date + datetime.timedelta(days = 1),
		preceeding = False,
	)

	return start_date, end_date, start_maturity_date, end_maturity_date, None

def find_loans_for_weekly_repayment_reminder(
	session: Session,
	customer_ids: List[str],
	start_date: datetime.date,
	start_maturity_date: datetime.date,
	end_maturity_date: datetime.date,
) -> Tuple[ Dict[str, Dict[ datetime.date, List[models.Loan]]], errors.Error ]:
	# In the email template, we will make note that the alert email:
	# 
	# 1. Doesn't account for any open loans w/o repayments before this date range
	# 2. That settling or setting up repayments will alter the estimated amounts
	# 
	# With those two points in mind, we only need to grab the loans for which
	# repayments would be generated for during *this* time period and on the
	# *assumption* that no repayments will be manually made or settled before
	# these cron jobs run.
	
	loans, err = queries.get_open_mature_loans_for_target_customers(
		session,
		customer_ids,
		end_date = end_maturity_date,
		start_date = start_maturity_date,
	)
	if err:
		return None, err

	# Match loans with their respective dates
	company_to_per_date_loans: Dict[str, Dict[ datetime.date, List[models.Loan]]] = {}
	for customer_id in customer_ids: 
		date_to_loan_map: Dict[datetime.date, List[models.Loan]] = {}
		for i in range(5):
			date_to_prepare = date_util.get_nearest_business_day(
				start_date + datetime.timedelta(days = i + 1),
				preceeding = False,
			)
			date_to_loan_map[date_to_prepare] = []

		for loan in loans:
			if str(loan.company_id) == customer_id:
				date_to_loan_map[loan.adjusted_maturity_date].append(loan)

		company_to_per_date_loans[customer_id] = date_to_loan_map		
	
	return company_to_per_date_loans, None

def generate_repayments_for_mature_loans(
	session: Session,
	customer_lookup: Dict[str, models.Company],
	company_settings_lookup: Dict[str, models.CompanySettings],
	per_company_loans: Dict[str, List[models.Loan]],
	submitted_by_user_id: str,
	today_date: datetime.date
) -> Tuple[ List[Dict[str, Any]], errors.Error ]:
	alert_data: List[Dict[str, Any]] = []
	deposit_date = date_util.add_biz_days(
		today_date, 
		days_to_add = 2
	)
	deposit_date_str = date_util.date_to_db_str(deposit_date)
	settlement_date = date_util.get_nearest_business_day(
		deposit_date + datetime.timedelta(days = 1), 
		preceeding = False
	)
	settlement_date_str = date_util.date_to_db_str(settlement_date)

	for company_id in per_company_loans:
		loans = per_company_loans[company_id]
	
		requested_amount = 0.0
		requested_to_principal = 0.0
		requested_to_interest = 0.0
		requested_to_late_fees = 0.0
		requested_loan_ids: List[str] = []
		per_loan_alert_data: List[Dict[str, Any]] = []
		for loan in loans:
			principal = float(loan.outstanding_principal_balance) if loan.outstanding_principal_balance is not None else 0.0
			requested_to_principal += principal

			interest = float(loan.outstanding_interest) if loan.outstanding_interest is not None else 0.0
			requested_to_interest += interest

			late_fees = float(loan.outstanding_fees) if loan.outstanding_fees is not None else 0.0
			requested_to_late_fees += late_fees

			loan_repayment_amount = principal + interest + late_fees
			requested_amount += loan_repayment_amount
			
			requested_loan_ids.append(str(loan.id))
			per_loan_alert_data.append({
				"loan_identifier": f"{customer_lookup[str(loan.company_id)].identifier}-{loan.disbursement_identifier}",
				"total_amount": loan_repayment_amount,
				"principal": principal,
				"interest": interest,
				"late_fees": late_fees,
				"maturity_date": loan.adjusted_maturity_date,
			})

		repayment_effect, err = repayment_util.calculate_repayment_effect(
			session = session,
			company_id = company_id,
			payment_option = PaymentOption.IN_FULL,
			amount = requested_amount,
			deposit_date = deposit_date_str,
			settlement_date = settlement_date_str,
			items_covered = {
				'loan_ids': requested_loan_ids,
				'requested_to_principal': requested_to_principal,
				'requested_to_interest': requested_to_interest,
				'requested_to_late_fees': requested_to_late_fees,
				'requested_to_account_fees': 0.0,
			},
			should_pay_principal_first = False,
		)
		if err:
			return None, err

		repayment_data = repayment_effect['data']
		final_requested_amount = repayment_data['amount_to_pay']
		final_principal_amount = repayment_data['payable_amount_principal']
		final_interest_amount = repayment_data['payable_amount_interest']
		final_late_fees_amount = repayment_data['payable_amount_late_fees']

		repayment = models.Payment()
		repayment.company_id = str(loan.company_id)
		repayment.type = PaymentType.REPAYMENT
		repayment.method = PaymentMethodEnum.REVERSE_DRAFT_ACH
		repayment.requested_payment_date = deposit_date
		repayment.deposit_date = deposit_date
		repayment.requested_amount = Decimal(final_requested_amount)
		repayment.items_covered = cast(model_types.PaymentItemsCoveredDict, {
			'loan_ids': requested_loan_ids,
			'payment_option': RepaymentOption.PAY_IN_FULL,
			'requested_to_principal': final_principal_amount,
			'requested_to_interest': final_interest_amount,
			'requested_to_late_fees': final_late_fees_amount,
			'forecasted_principal': final_principal_amount,
			'forecasted_interest': final_interest_amount,
			'forecasted_late_fees': final_late_fees_amount,
		})
		repayment.company_bank_account_id = str(company_settings_lookup[str(loan.company_id)].collections_bank_account_id)
		repayment.submitted_at = date_util.now()
		repayment.submitted_by_user_id = submitted_by_user_id
		repayment.bank_note = 'This repayment was generated automatically by a recurring api job.'
		session.add(repayment)
		session.commit()

		alert_data.append({
			"customer_id": str(loan.company_id),
			"customer_name": customer_lookup[str(loan.company_id)].name,
			"repayment_id": str(repayment.id),
			"requested_amount": final_requested_amount,
			"per_loan_alert_data": per_loan_alert_data,
			"deposit_date": deposit_date,
		})

	return alert_data, None

def format_email_alert_data(
	alert_data: List[Dict[str, Any]],
) -> Tuple[ Dict[str, Dict[str, str] ], errors.Error ]:
	html_dict: Dict[str, Dict[str, str] ] = {}
	bespoke_table_begin = f"""
		<table id='loans-coming-due-table' style='font-size:13px;width:100%;padding:0;border-collapse:collapse;text-align:left;margin:0 0 20px 0'>
			<thead>
				<tr>
					<th style='width:15%;padding:5px;font-weight:normal;background:#cbdfb8;'>Company</th>
					<th style='width:15%;padding:5px;font-weight:normal;background:#cbdfb8;'>Repayment ID</th>
					<th style='width:10%;padding:5px;font-weight:normal;background:#cbdfb8;'>Loan</th>
					<th style='width:10%;padding:5px;font-weight:normal;background:#cbdfb8;'>Withdraw Date</th>
					<th style='width:10%;padding:5px;font-weight:normal;background:#cbdfb8;'>Maturity Date</th>
					<th style='width:10%;padding:5px;font-weight:normal;background:#cbdfb8;'>Principal</th>
					<th style='width:10%;padding:5px;font-weight:normal;background:#cbdfb8;'>Interest</th>
					<th style='width:10%;padding:5px;font-weight:normal;background:#cbdfb8;'>Late Fees</th>
					<th style='width:10%;padding:5px;font-weight:normal;background:#cbdfb8;'>Loan Total</th>
				</tr>
			</thead>
			<tbody>
	"""
	customer_table_begin = f"""
		<table id='loans-coming-due-table' style='font-size:13px;width:100%;padding:0;border-collapse:collapse;text-align:left;margin:0 0 20px 0'>
			<thead>
				<tr>
					<th style='width:15%;padding:5px;font-weight:normal;background:#cbdfb8;'>Loan</th>
					<th style='width:10%;padding:5px;font-weight:normal;background:#cbdfb8;'>Withdraw Date</th>
					<th style='width:10%;padding:5px;font-weight:normal;background:#cbdfb8;'>Maturity Date</th>
					<th style='width:15%;padding:5px;font-weight:normal;background:#cbdfb8;'>Principal</th>
					<th style='width:15%;padding:5px;font-weight:normal;background:#cbdfb8;'>Interest</th>
					<th style='width:15%;padding:5px;font-weight:normal;background:#cbdfb8;'>Late Fees</th>
					<th style='width:15%;padding:5px;font-weight:normal;background:#cbdfb8;'>Loan Total</th>
				</tr>
			</thead>
			<tbody>
	"""
	table_end = f"""
			</tbody>
		</table>
	"""

	for alert in alert_data:
		rows = alert["per_loan_alert_data"]
		bespoke_rows_html = ""
		customer_rows_html = ""
		row_count = 0 # used to alternate background color on html table row
		running_total = 0.0
		for row in rows:
			bespoke_rows_html += f"""
				<tr style='background-color:#{"fff" if row_count % 2 == 0 else "eee"};'>
					<td style='padding:5px;'>{alert["customer_name"] if row_count == 0 else ""}</td>
					<td style='padding:5px;'>{alert["repayment_id"] if row_count == 0 else ""}</td>
					<td style='padding:5px;'>{row["loan_identifier"]}</td>
					<td style='padding:5px;'>{date_util.human_readable_yearmonthday_from_date(alert["deposit_date"])}</td>
					<td style='padding:5px;'>{date_util.human_readable_yearmonthday_from_date(row["maturity_date"])}</td>
					<td style='padding:5px;'>{number_util.to_dollar_format(row["principal"])}</td>
					<td style='padding:5px;'>{number_util.to_dollar_format(row["interest"])}</td>
					<td style='padding:5px;'>{number_util.to_dollar_format(row["late_fees"])}</td>
					<td style='padding:5px;'>{number_util.to_dollar_format(row["total_amount"])}</td>
				</tr>
			"""

			customer_rows_html += f"""
				<tr style='background-color:#{"fff" if row_count % 2 == 0 else "eee"};'>
					<td style='padding:5px;'>{row["loan_identifier"]}</td>
					<td style='padding:5px;'>{date_util.human_readable_yearmonthday_from_date(alert["deposit_date"])}</td>
					<td style='padding:5px;'>{date_util.human_readable_yearmonthday_from_date(row["maturity_date"])}</td>
					<td style='padding:5px;'>{number_util.to_dollar_format(row["principal"])}</td>
					<td style='padding:5px;'>{number_util.to_dollar_format(row["interest"])}</td>
					<td style='padding:5px;'>{number_util.to_dollar_format(row["late_fees"])}</td>
					<td style='padding:5px;'>{number_util.to_dollar_format(row["total_amount"])}</td>
				</tr>
			"""

			row_count += 1
			running_total += row["total_amount"]

		bespoke_footer_row = f"""
			<tr style='border-top:#000 3px solid;'>
				<td colspan='8' style='padding:5px;text-align:right;'>
					<strong>Repayment Total:</strong>
				</td>
				<td style='padding:5px;'>{number_util.to_dollar_format(running_total)}</td>
			</tr>
		"""

		customer_footer_row = f"""
			<tr style='border-top:#000 3px solid;'>
				<td colspan='6' style='padding:5px;text-align:right;'>
					<strong>Repayment Total:</strong>
				</td>
				<td style='padding:5px;'>{number_util.to_dollar_format(running_total)}</td>
			</tr>
		"""

		html_dict[alert["customer_id"]] = {}
		html_dict[alert["customer_id"]]["bespoke_html"] = bespoke_table_begin + bespoke_rows_html + bespoke_footer_row + table_end
		html_dict[alert["customer_id"]]["customer_html"] = customer_table_begin + customer_rows_html + customer_footer_row + table_end
		html_dict[alert["customer_id"]]["customer_name"] = alert["customer_name"]

	return html_dict, None

def generate_html_for_weekly_repayment_reminder(
	session: Session,
	customer_lookup: Dict[str, models.Company],
	customer_balance_lookup: Dict[str, loan_balances.CustomerBalance],
	company_to_per_date_loans: Dict[str, Dict[ datetime.date, List[models.Loan]]],
	start_maturity_date: datetime.date,
	end_maturity_date: datetime.date,
) -> Tuple[ Dict[str, Dict[str, str] ], errors.Error ]:
	html_dict: Dict[str, Dict[str, str] ] = {}
	table_begin = f"""
		<table id='loans-coming-due-table' style='font-size:13px;width:100%;padding:0;border-collapse:collapse;text-align:left;margin:0 0 20px 0'>
			<thead>
				<tr>
					<th style='width:15%;padding:5px;font-weight:normal;background:#cbdfb8;'>Loan</th>
					<th style='width:10%;padding:5px;font-weight:normal;background:#cbdfb8;'>Withdraw Date</th>
					<th style='width:10%;padding:5px;font-weight:normal;background:#cbdfb8;'>Maturity Date</th>
					<th style='width:15%;padding:5px;font-weight:normal;background:#cbdfb8;'>Principal</th>
					<th style='width:15%;padding:5px;font-weight:normal;background:#cbdfb8;'>Interest</th>
					<th style='width:15%;padding:5px;font-weight:normal;background:#cbdfb8;'>Late Fees</th>
					<th style='width:15%;padding:5px;font-weight:normal;background:#cbdfb8;'>Loan Total</th>
				</tr>
			</thead>
			<tbody>
	"""
	table_end = f"""
			</tbody>
		</table>
	"""

	for company_id in company_to_per_date_loans:
		per_date_loans = company_to_per_date_loans[company_id]
		company_html: str = ""

		loan_update_lookup: Dict[str, Dict[datetime.date, LoanUpdateDict]] = {}
		update_tuple, err = customer_balance_lookup[str(company_id)].update(
			start_maturity_date,
			end_maturity_date,
			include_debug_info = False, # 
			is_past_date_default_val = False, #
		)
		if err:
			return None, err

		for tuple_date, update_data in update_tuple.items():
			if update_data is None:
				continue

			loan_updates = update_data.get("loan_updates", None)
				
			if loan_updates:
				for update in loan_updates:
					loan_id = update.get("loan_id", "")
					if loan_id != "":
						if loan_id not in loan_update_lookup:
							loan_update_lookup[str(loan_id)] = {}
						loan_update_lookup[str(loan_id)][tuple_date] = update

		for target_date in per_date_loans:
			loans = per_date_loans[target_date]

			if len(loans) > 0:
				rows_html = ""
				running_total = 0.0
				row_count = 0
				for loan in loans:
					principal = float(loan_update_lookup[str(loan.id)][target_date]["outstanding_principal"])
					interest = float(loan_update_lookup[str(loan.id)][target_date]["outstanding_interest"])
					late_fees = float(loan_update_lookup[str(loan.id)][target_date]["outstanding_fees"])
					total_amount = principal + interest + late_fees
					running_total += total_amount

					rows_html += f"""
						<tr style='background-color:#{"fff" if row_count % 2 == 0 else "eee"};'>
							<td style='padding:5px;'>{loan.identifier}</td>
							<td style='padding:5px;'>{date_util.human_readable_yearmonthday_from_date(target_date)}</td>
							<td style='padding:5px;'>{date_util.human_readable_yearmonthday_from_date(loan.adjusted_maturity_date)}</td>
							<td style='padding:5px;'>{number_util.to_dollar_format(principal)}</td>
							<td style='padding:5px;'>{number_util.to_dollar_format(interest)}</td>
							<td style='padding:5px;'>{number_util.to_dollar_format(late_fees)}</td>
							<td style='padding:5px;'>{number_util.to_dollar_format(total_amount)}</td>
						</tr>
					"""

					row_count += 1

				footer_row = f"""
					<tr style='border-top:#000 3px solid;'>
						<td colspan='6' style='padding:5px;text-align:right;'>
							<strong>Repayment Total:</strong>
						</td>
						<td style='padding:5px;'>{number_util.to_dollar_format(running_total)}</td>
					</tr>
				"""

				company_html += table_begin + rows_html + footer_row + table_end

		html_dict[company_id] = {}
		html_dict[company_id]["html"] = company_html
		html_dict[company_id]["customer_name"] = customer_lookup[company_id].name

	return html_dict, None
