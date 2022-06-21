import datetime
import logging
from decimal import Decimal
from typing import Any, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models, model_types, queries
from bespoke.db.db_constants import FeatureFlagEnum, PaymentType, PaymentMethodEnum
from bespoke.finance import number_util
from bespoke.finance.payments.payment_util import RepaymentOption
from sqlalchemy.orm.session import Session

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
		allow_dummy = True,
		# allow_dummy = False,
	)
	if err:
		return None, None, None, err

	logging.info("Customer Settings")
	logging.info(customer_settings)
	settings_lookup: Dict[str, models.CompanySettings] = {}
	for settings in customer_settings:
		settings_lookup[str(settings.company_id)] = settings

	filtered_customer_ids: List[str] = []
	for financial_summary in financial_summaries:
		company_id = str(financial_summary.company_id)
		supported_product_type = financial_summary.product_type in supported_product_types
		non_dummy = company_id in settings_lookup and settings_lookup[company_id].is_dummy_account is True
		#non_dummy = company_id in settings_lookup and settings_lookup[company_id].is_dummy_account is False

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

	logging.info("Filtered Customer IDs")
	logging.info(filtered_customer_ids)
	# Will be used to grab company info for the generated email rows
	filtered_customers: List[models.Company] = []
	for customer in customers:
		if str(customer.id) in filtered_customer_ids:
			filtered_customers.append(customer)

	customer_lookup: Dict[str, models.Company] = {}
	for customer in filtered_customers:
		logging.info(str(customer.id))
		customer_lookup[str(customer.id)] = customer

	return customer_lookup, filtered_customer_ids, settings_lookup, None

def find_mature_loans_without_open_repayments(
	session: Session,
	customer_ids: List[str],
	today_date: datetime.date
) -> Tuple[ Dict[str, List[models.Loan]], errors.Error ]:
	# We are getting the nearest (future-facing) business day
	# to account for the payment arriving and settling -on- the
	# maturity date, not a day after
	target_maturity_date = date_util.get_nearest_business_day(
		today_date + datetime.timedelta(days=1),
		preceeding=False,
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

	# We will be using the transactions to map from the
	# loan to the respective repayments
	transactions, err = queries.get_transactions(
		session,
		all_loan_ids,
		is_repayment = True,
	)
	if err:
		return None, err

	all_payment_ids: List[str] = []
	loan_to_payments_lookup: Dict[ str, List[str] ] = {}
	for transaction in transactions:
		loan_id = str(transaction.loan_id)
		payment_id = str(transaction.payment_id)

		all_payment_ids.append(payment_id)

		if loan_id not in loan_to_payments_lookup:
			loan_to_payments_lookup[loan_id] = []
		loan_to_payments_lookup[loan_id].append(payment_id)

	# This section filters out the settled repayments
	# so we can determine which loans don't have
	# an open repayment at the moment
	open_payments, err = queries.get_payments(
		session,
		all_payment_ids,
		is_unsettled = True,
	)
	if err:
		return None, err


	open_payment_ids = []
	for payment in open_payments:
		open_payment_ids.append(str(payment.id))
	
	# Now that we have filtered out the settled
	# repayments, here is where we determine
	# which loans need repayments
	filtered_per_company_loans: Dict[str, List[models.Loan]] = {}
	for loan in loans:
		open_match_found = False
		loan_id = str(loan.id)

		if loan_id in loan_to_payments_lookup:
			payment_ids = loan_to_payments_lookup[loan_id]
			for payment_id in payment_ids:
				if payment_id in open_payment_ids:
					open_match_found = True
					break

		if open_match_found is False:
			company_id = str(loan.company_id)
			if company_id not in filtered_per_company_loans:
				filtered_per_company_loans[company_id] = []
			filtered_per_company_loans[company_id].append(loan)

	return filtered_per_company_loans, None

def generate_repayments_for_mature_loans(
	session: Session,
	customer_lookup: Dict[str, models.Company],
	company_settings_lookup: Dict[str, models.CompanySettings],
	per_company_loans: Dict[str, List[models.Loan]],
	submitted_by_user_id: str,
) -> Tuple[ List[Dict[str, Any]], errors.Error ]:
	alert_data: List[Dict[str, Any]] = []
	for company_id in per_company_loans:
		loans = per_company_loans[company_id]
	
		requested_amount = 0.0
		requested_loan_ids: List[str] = []
		per_loan_alert_data: List[Dict[str, Any]] = []
		for loan in loans:
			principal = float(loan.outstanding_principal_balance) if loan.outstanding_principal_balance is not None else 0.0
			interest = float(loan.outstanding_interest) if loan.outstanding_interest is not None else 0.0
			late_fees = float(loan.outstanding_fees) if loan.outstanding_fees is not None else 0.0
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

		repayment = models.Payment()
		repayment.company_id = str(loan.company_id)
		repayment.type = PaymentType.REPAYMENT
		repayment.method = PaymentMethodEnum.REVERSE_DRAFT_ACH
		repayment.requested_amount = Decimal(requested_amount)
		repayment.requested_payment_date = date_util.get_earliest_requested_payment_date(date_util.DEFAULT_TIMEZONE)
		repayment.items_covered = cast(model_types.PaymentItemsCoveredDict, {
			"loan_ids": requested_loan_ids,
			"payment_option": RepaymentOption.PAY_IN_FULL,
			"requested_to_interest": 0.0,
			"requested_to_principal": 0.0,
			"requested_to_late_fees": 0.0,
		})
		repayment.company_bank_account_id = str(company_settings_lookup[str(loan.company_id)].collections_bank_account_id)
		repayment.submitted_at = date_util.now()
		repayment.submitted_by_user_id = submitted_by_user_id
		repayment.bank_note = 'This repayment was generated automatically by a recurring api job.'
		session.add(repayment)
		session.flush()

		alert_data.append({
			"customer_id": str(loan.company_id),
			"customer_name": customer_lookup[str(loan.company_id)].name,
			"repayment_id": str(repayment.id),
			"requested_amount": requested_amount,
			"per_loan_alert_data": per_loan_alert_data,
		})

	return alert_data, None

def format_email_alert_data(
	alert_data: List[Dict[str, Any]],
	today_date: datetime.date
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
					<td style='padding:5px;'>{date_util.human_readable_yearmonthday_from_date(today_date)}</td>
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
					<td style='padding:5px;'>{date_util.human_readable_yearmonthday_from_date(today_date)}</td>
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

