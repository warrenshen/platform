from decimal import Decimal
from typing import cast, Dict, List, Tuple
from sqlalchemy.orm.session import Session

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import (AutomatedSurveillanceMessage, ClientSurveillanceCategoryEnum, 
	CompanySurveillanceStatus, RequestStatusEnum)
from bespoke.email import sendgrid_util
from flask import current_app
from server.config import Config

def submit_ebba_application_for_approval(
	session: Session,
	ebba_application: models.EbbaApplication,
	company_id: str,
	user_id: str
) -> Tuple[bool, errors.Error]:
	if not ebba_application:
		return False, errors.Error('Could not find EBBA application with given ID')

	if not ebba_application.application_date:
		return False, errors.Error('Application month is required')

	ebba_application.status = RequestStatusEnum.APPROVAL_REQUESTED
	ebba_application.requested_at = date_util.now()
	ebba_application.submitted_by_user_id = user_id

	# Upon submitting new financials, we will turned the previous month's surveillance status
	# of that company to `In Review`. We do this because we don't want to send
	# an advance to that company in the event that the submitted financials
	# reveal some evidence that would negatively impact our underwriting
	# considerations. For most cases though, the happy path is for the customer
	# to switch to `In Review`, get reviewed, then return to normal lending activity
	qualifying_date = date_util.get_previous_month_last_date(date_util.now_as_date())
	most_recent_customer_surveillance_result = cast(
		models.CustomerSurveillanceResult,
		session.query(models.CustomerSurveillanceResult).filter(
			models.CustomerSurveillanceResult.company_id == company_id
		).order_by(
			models.CustomerSurveillanceResult.qualifying_date.desc()
		).first())

	if not most_recent_customer_surveillance_result:
		most_recent_customer_surveillance_result = models.CustomerSurveillanceResult( #type: ignore
			company_id = company_id,
			qualifying_date = qualifying_date,
			submitting_user_id = user_id,
			metadata_info = {}
		)

		session.add(most_recent_customer_surveillance_result)
		session.flush()

	# We replace the message first so that we don't keep adding the automated message 
	# over and over again
	original_note = most_recent_customer_surveillance_result.bank_note.replace(
		AutomatedSurveillanceMessage.IN_REVIEW, 
		""
	) if most_recent_customer_surveillance_result.bank_note is not None else ""

	if most_recent_customer_surveillance_result.surveillance_status != CompanySurveillanceStatus.ON_PAUSE and \
		most_recent_customer_surveillance_result.surveillance_status != CompanySurveillanceStatus.DEFAULTED:
		most_recent_customer_surveillance_result.surveillance_status = CompanySurveillanceStatus.IN_REVIEW
		most_recent_customer_surveillance_resultsurveillance_status_note = f'{original_note} {AutomatedSurveillanceMessage.IN_REVIEW}'

	return True, None

def send_ebba_application_submission_email(
	cfg: Config,
	customer_name: str
) -> Tuple[bool, errors.Error]:
	sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

	# TODO (warrenshen): actually set up link to EBBA application here.
	ebba_application_html = '<span>LINK HERE</span>'
	template_name = sendgrid_util.TemplateNames.CUSTOMER_SUBMITTED_EBBA_APPLICATION
	template_data = {
		'customer_name': customer_name,
		'ebba_application_html': ebba_application_html
	}
	recipients = cfg.BANK_NOTIFY_EMAIL_ADDRESSES
	_, err = sendgrid_client.send(
		template_name, 
		template_data, 
		recipients,
		filter_out_contact_only=True
	)
	if err:
		return False, err
	else:
		return True, None

def add_financial_report(
	session: Session,
	company_id: str,
	application_date: str,
	expires_date: str,
	ebba_application_files: List[Dict[str, str]]
) -> Tuple[models.EbbaApplication, int, errors.Error]:
	# used only for unit tests
	files_added_count = 0

	ebba_application = models.EbbaApplication( #type:ignore
		company_id = company_id,
		status = RequestStatusEnum.APPROVAL_REQUESTED,
		category = ClientSurveillanceCategoryEnum.FINANCIAL_REPORT,
		application_date = date_util.load_date_str(application_date),
		expires_date = date_util.load_datetime_str(expires_date)
	)
	session.add(ebba_application)
	session.flush()

	for file in ebba_application_files:
		if 'file_id' in file:
			session.add(models.EbbaApplicationFile( #type:ignore
				ebba_application_id = ebba_application.id,
				file_id = file['file_id']
			))
			files_added_count += 1

	return ebba_application, files_added_count, None

def update_financial_report(
	session: Session,
	ebba_application_id: str,
	application_date: str,
	expires_date: str,
	ebba_application_files: List[Dict[str, str]]
) -> Tuple[models.EbbaApplication, int, int, errors.Error]:
	# used only for unit tests
	files_added_count = 0
	files_removed_count = 0

	ebba_application = cast(
		models.EbbaApplication,
		session.query(models.EbbaApplication).filter(
			models.EbbaApplication.id == ebba_application_id
		).first())

	ebba_application.application_date = date_util.load_date_str(application_date)
	ebba_application.expires_date = date_util.load_datetime_str(expires_date)

	ebba_application_file_ids: List[str] = []
	for file in ebba_application_files:
		if 'file_id' in file:
			ebba_application_file_ids.append(file['file_id'])

	current_ebba_application_files = cast(
		List[models.EbbaApplicationFile],
		session.query(models.EbbaApplicationFile).filter(
			models.EbbaApplicationFile.file_id.in_(ebba_application_file_ids)
		).all())
	for ebba_application_file in current_ebba_application_files:
		session.delete(ebba_application_file) # type: ignore
		files_removed_count += 1

	session.flush()
	
	for file in ebba_application_files:
		if 'file_id' in file:
			session.add(models.EbbaApplicationFile( #type:ignore
				ebba_application_id = ebba_application.id,
				file_id = file['file_id']
			))
			files_added_count += 1

	return ebba_application, files_removed_count, files_added_count, None

def add_borrowing_base(
	session: Session,
	company_id: str,
	application_date: str,
	monthly_accounts_receivable: float,
	monthly_inventory: float,
	monthly_cash: float,
	amount_cash_in_daca: float,
	amount_custom: float,
	amount_custom_note: str,
	calculated_borrowing_base: float,
	expires_date: str,
	ebba_application_files: List[Dict[str, str]]
) -> Tuple[models.EbbaApplication, int, errors.Error]:
	# used only for unit tests
	files_added_count = 0

	ebba_application = models.EbbaApplication( #type:ignore
		company_id = company_id,
		status = RequestStatusEnum.APPROVAL_REQUESTED,
		category = ClientSurveillanceCategoryEnum.BORROWING_BASE,
		application_date = date_util.load_date_str(application_date),
		monthly_accounts_receivable = monthly_accounts_receivable,
		monthly_inventory = monthly_inventory,
		monthly_cash = monthly_cash,
		amount_cash_in_daca = amount_cash_in_daca,
		amount_custom = amount_custom,
		amount_custom_note = amount_custom_note,
		calculated_borrowing_base = calculated_borrowing_base,
		expires_date = date_util.load_datetime_str(expires_date)
	)
	session.add(ebba_application)
	session.flush()

	for file in ebba_application_files:
		if 'file_id' in file:
			session.add(models.EbbaApplicationFile( #type:ignore
				ebba_application_id = ebba_application.id,
				file_id = file['file_id']
			))
			files_added_count += 1

	return ebba_application, files_added_count, None

def update_borrowing_base(
	session: Session,
	ebba_application_id: str,
	application_date: str,
	monthly_accounts_receivable: float,
	monthly_inventory: float,
	monthly_cash: float,
	amount_cash_in_daca: float,
	amount_custom: float,
	amount_custom_note: str,
	calculated_borrowing_base: float,
	expires_date: str,
	ebba_application_files: List[Dict[str, str]]
) -> Tuple[models.EbbaApplication, int, int, errors.Error]:
	# used only for unit tests
	files_added_count = 0
	files_removed_count = 0

	ebba_application = cast(
		models.EbbaApplication,
		session.query(models.EbbaApplication).filter(
			models.EbbaApplication.id == ebba_application_id
		).first())

	ebba_application.application_date = date_util.load_date_str(application_date)
	ebba_application.monthly_accounts_receivable = Decimal(monthly_accounts_receivable) if monthly_accounts_receivable is not None else None
	ebba_application.monthly_inventory = Decimal(monthly_inventory) if monthly_inventory is not None else None
	ebba_application.monthly_cash = Decimal(monthly_cash) if monthly_cash is not None else None
	ebba_application.amount_cash_in_daca = Decimal(amount_cash_in_daca) if amount_cash_in_daca is not None else None
	ebba_application.amount_custom = Decimal(amount_custom) if amount_custom is not None else None
	ebba_application.amount_custom_note = amount_custom_note if amount_custom_note is not None else None
	ebba_application.calculated_borrowing_base = Decimal(calculated_borrowing_base)
	ebba_application.expires_date = date_util.load_datetime_str(expires_date)

	ebba_application_file_ids: List[str] = []
	for file in ebba_application_files:
		if 'file_id' in file:
			ebba_application_file_ids.append(file['file_id'])

	current_ebba_application_files = cast(
		List[models.EbbaApplicationFile],
		session.query(models.EbbaApplicationFile).filter(
			models.EbbaApplicationFile.file_id.in_(ebba_application_file_ids)
		).all())
	for ebba_application_file in current_ebba_application_files:
		session.delete(ebba_application_file) # type: ignore
		files_removed_count += 1

	session.flush()
	
	for file in ebba_application_files:
		if 'file_id' in file:
			session.add(models.EbbaApplicationFile( #type:ignore
				ebba_application_id = ebba_application.id,
				file_id = file['file_id']
			))
			files_added_count += 1

	return ebba_application, files_removed_count, files_added_count, None
