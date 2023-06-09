import json
import logging
import os
import sqlalchemy
from typing import Any, Dict, Tuple

from datetime import datetime
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.config import is_development_env, is_test_env
from sqlalchemy.orm import sessionmaker

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models, seed_util
from bespoke.db.db_constants import ProductType, TwoFactorMessageMethod, LoginMethod, \
	BankAccountType, RequestStatusEnum, NewPurchaseOrderStatus, PurchaseOrderFileTypeEnum
from bespoke.db.models import session_scope
from bespoke.db.seed import setup_db_test
from server.views.common import handler_util

handler = Blueprint('cypress', __name__)

def get_field_or_default(
	form: Dict[str, Any],
	field_name: str,
	default_value: Any,
) -> Any:
	return form[field_name] \
		if field_name in form and form[field_name] is not None \
		else default_value

def run_cypress_preflight_checks() -> Tuple[sessionmaker, errors.Error]:
	if (
		not is_test_env(os.environ.get('FLASK_ENV')) and
		not is_development_env(os.environ.get('FLASK_ENV'))
	):
		logging.warning(f'Reset database not allowed in {os.environ.get("FLASK_ENV")} env...')
		return None, errors.Error('Failure: this action is only allowed in development and test environments')

	db_url = models.get_db_url()
	engine = sqlalchemy.create_engine(db_url)
	models.Base.metadata.create_all(engine)
	session_maker = sessionmaker(engine)

	return session_maker, None

class ResetDatabaseView(MethodView):

	def post(self, **kwargs: Any) -> Response:
		if (
			not is_test_env(os.environ.get('FLASK_ENV')) and
			not is_development_env(os.environ.get('FLASK_ENV'))
		):
			logging.warning(f'Reset database not allowed in {os.environ.get("FLASK_ENV")} env...')
			return make_response(json.dumps({
				'status': 'ERROR',
				'msg': 'Failure: this action is only allowed in development and test environments',
			}))

		logging.info('Reset database in progress...')
		setup_db_test(current_app)
		logging.info('Reset database complete...')

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
		}))

class AddBankAccountView(MethodView):
	def post(self, **kwargs: Any) -> Response:
		session_maker, err = run_cypress_preflight_checks()
		if err:
			raise err

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response("No data provided")

		account_number = get_field_or_default(form, 'account_number', '123456')
		account_title = get_field_or_default(form, 'account_title', 'Cypress Checking')
		account_type = get_field_or_default(form, 'account_type', BankAccountType.CHECKING)
		ach_default_memo = get_field_or_default(form, 'ach_default_memo', '')
		bank_address = get_field_or_default(form, 'bank_address', '123 Main Street, Annapolis, MD 21401')
		bank_instructions_file_id = get_field_or_default(form, 'bank_instructions_file_id', None)
		bank_name = get_field_or_default(form, 'bank_name', 'Cypress Credit Union')
		can_ach = get_field_or_default(form, 'can_ach', True)
		can_wire = get_field_or_default(form, 'can_wire', True)
		company_id = get_field_or_default(form, 'company_id', None)
		created_at = get_field_or_default(form, 'created_at', date_util.now())
		id = get_field_or_default(form, 'id', None)
		intermediary_account_name = get_field_or_default(form, 'intermediary_account_name', None)
		intermediary_account_number = get_field_or_default(form, 'intermediary_account_number', None)
		intermediary_bank_address = get_field_or_default(form, 'intermediary_bank_address', None)
		intermediary_bank_name = get_field_or_default(form, 'intermediary_bank_name', None)
		is_bank_international = get_field_or_default(form, 'is_bank_international', False)
		is_cannabis_compliant = get_field_or_default(form, 'is_cannabis_compliant', True)
		is_deleted = get_field_or_default(form, 'is_deleted', None)
		is_wire_intermediary = get_field_or_default(form, 'is_wire_intermediary', False)
		recipient_address = get_field_or_default(form, 'recipient_address', None)
		recipient_address_2 = get_field_or_default(form, 'recipient_address_2', None)
		recipient_name = get_field_or_default(form, 'recipient_name', '')
		routing_number = get_field_or_default(form, 'routing_number', '0321654')
		torrey_pines_template_name = get_field_or_default(form, 'torrey_pines_template_name', None)
		updated_at = get_field_or_default(form, 'updated_at', None)
		us_state = get_field_or_default(form, 'us_state', 'MD')
		verified_at = get_field_or_default(form, 'verified_at', date_util.now())
		verified_date = get_field_or_default(form, 'verified_date', date_util.now_as_date())
		wire_default_memo = get_field_or_default(form, 'wire_default_memo', None)
		wire_routing_number = get_field_or_default(form, 'wire_routing_number', '9513570')
		wire_template_name = get_field_or_default(form, 'wire_template_name', None)

		bank_account_id = ''
		with session_scope(session_maker) as session:
			logging.info('Adding bank account for cypress test...')

			bank_account, err = seed_util.create_bank_account(
				session,
				account_number,
				account_title,
				account_type,
				ach_default_memo,
				bank_address,
				bank_instructions_file_id,
				bank_name,
				can_ach,
				can_wire,
				company_id,
				created_at,
				id,
				intermediary_account_name,
				intermediary_account_number,
				intermediary_bank_address,
				intermediary_bank_name,
				is_bank_international,
				is_cannabis_compliant,
				is_deleted,
				is_wire_intermediary,
				recipient_address,
				recipient_address_2,
				recipient_name,
				routing_number,
				torrey_pines_template_name,
				updated_at,
				us_state,
				verified_at,
				verified_date,
				wire_default_memo,
				wire_routing_number,
				wire_template_name,
			)
			if err:
				raise err

			bank_account_id = str(bank_account.id)
			
			logging.info('Finished adding bank acccount for cypress test...')

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'bank_account_id': bank_account_id,
			},
		}))

class AddCompanyView(MethodView):
	def post(self, **kwargs: Any) -> Response:
		session_maker, err = run_cypress_preflight_checks()
		if err:
			raise err
	
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response("No data provided")

		address = get_field_or_default(form, 'address', '123 Main Street')
		city = get_field_or_default(form, 'city', 'Annapolis')
		company_settings_id = get_field_or_default(form, 'company_settings_id', None)
		contract_id = get_field_or_default(form, 'contract_id', None)
		contract_name = get_field_or_default(form, 'contract_name', 'Cypress, Inc.')
		country = get_field_or_default(form, 'country', 'USA')
		dba_name = get_field_or_default(form, 'dba_name', 'Cypriot')
		debt_facility_status = get_field_or_default(form, 'debt_facility_status', None)
		debt_facility_waiver_date = get_field_or_default(form, 'debt_facility_waiver_date', None)
		debt_facility_waiver_expiration_date = get_field_or_default(form, 'debt_facility_waiver_expiration_date', None)
		id = get_field_or_default(form, 'id', None)
		identifier = get_field_or_default(form, 'identifier', 'CC')
		is_cannabis = get_field_or_default(form, 'is_cannabis', True)
		is_customer = get_field_or_default(form, 'is_customer', False)
		is_payor = get_field_or_default(form, 'is_payor', False)
		is_vendor = get_field_or_default(form, 'is_vendor', False)
		latest_disbursement_identifier = get_field_or_default(form, 'latest_disbursement_identifier', 0)
		latest_loan_identifier = get_field_or_default(form, 'latest_loan_identifier', 0)
		latest_repayment_identifier = get_field_or_default(form, 'latest_repayment_identifier', 0)
		name = get_field_or_default(form, 'name', 'Cypress Customer')
		parent_company_id = get_field_or_default(form, 'parent_company_id', None)
		phone_number = get_field_or_default(form, 'phone_number', '3011234567')
		qualify_for = get_field_or_default(form, 'qualify_for', ProductType.INVENTORY_FINANCING)
		state = get_field_or_default(form, 'state', 'MD')
		surveillance_status = get_field_or_default(form, 'surveillance_status', None)
		surveillance_status_note = get_field_or_default(form, 'surveillance_status_note', None)
		timezone = get_field_or_default(form, 'timezone', 'America/New York')
		zip_code = get_field_or_default(form, 'zip_code', '21037')

		export_company_id = ''
		export_company_settings_id = ''
		export_parent_company_id = ''
		with session_scope(session_maker) as session:
			logging.info('Adding company for cypress test...')

			company, company_settings, parent_company, err = seed_util.create_company(
				session,
				address,
				city,
				company_settings_id,
				contract_id,
				contract_name,
				country,
				dba_name,
				debt_facility_status,
				debt_facility_waiver_date,
				debt_facility_waiver_expiration_date,
				id,
				identifier,
				is_cannabis,
				is_customer,
				is_payor,
				is_vendor,
				latest_disbursement_identifier,
				latest_loan_identifier,
				latest_repayment_identifier,
				name,
				parent_company_id,
				phone_number,
				qualify_for,
				state,
				surveillance_status,
				surveillance_status_note,
				timezone,
				zip_code,
			)
			if err:
				raise err

			export_company_id = str(company.id)
			export_company_settings_id = str(company_settings.id)
			export_parent_company_id = str(parent_company.id)
			
			logging.info('Finished adding company for cypress test...')

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'company_id': export_company_id,
				'company_settings_id': export_company_settings_id,
				'parent_company_id': export_parent_company_id,
			},
		}))

class AddCompanyLicenseView(MethodView):
	def post(self, **kwargs: Any) -> Response:
		session_maker, err = run_cypress_preflight_checks()
		if err:
			raise err

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response("No data provided")

		company_id = get_field_or_default(form, 'company_id', None)
		created_at = get_field_or_default(form, 'created_at', date_util.now())
		estimate_latitude = get_field_or_default(form, 'estimate_latitude', None)
		estimate_longitude = get_field_or_default(form, 'estimate_longitude', None)
		estimate_zip = get_field_or_default(form, 'estimate_zip', None)
		expiration_date = get_field_or_default(form, 'expiration_date', None)
		facility_row_id = get_field_or_default(form, 'facility_row_id', None)
		file_id = get_field_or_default(form, 'file_id', None)
		id = get_field_or_default(form, 'id', None)
		is_current = get_field_or_default(form, 'is_current', True)
		is_deleted = get_field_or_default(form, 'is_deleted', False)
		is_underwriting_enabled = get_field_or_default(form, 'is_underwriting_enabled', False)
		legal_name = get_field_or_default(form, 'legal_name', 'Cypress, Inc.')
		license_category = get_field_or_default(form, 'license_category', 'distributor')
		license_description = get_field_or_default(form, 'license_description', 'Automation')
		license_number = get_field_or_default(form, 'license_number', 'C-0001')
		license_status = get_field_or_default(form, 'license_status', None)
		rollup_id = get_field_or_default(form, 'rollup_id', None)
		updated_at = get_field_or_default(form, 'updated_at', date_util.now())
		us_state = get_field_or_default(form, 'us_state', 'MD')

		company_license_id = ''
		with session_scope(session_maker) as session:
			logging.info('Adding company license for cypress test...')

			company_license, err = seed_util.create_company_license_new(
				session,
				company_id,
				created_at,
				estimate_latitude,
				estimate_longitude,
				estimate_zip,
				expiration_date,
				facility_row_id,
				file_id,
				id,
				is_current,
				is_deleted,
				is_underwriting_enabled,
				legal_name,
				license_category,
				license_description,
				license_number,
				license_status,
				rollup_id,
				updated_at,
				us_state,
			)
			if err:
				raise err

			company_license_id = str(company_license.id)
			
			logging.info('Finished adding company license for cypress test...')

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'company_license_id': company_license_id,
			},
		}))

class AddCompanyPartnershipRequestView(MethodView):
	def post(self, **kwargs: Any) -> Response:
		session_maker, err = run_cypress_preflight_checks()
		if err:
			raise err

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response("No data provided")

		company_name = get_field_or_default(form, 'company_name', 'Cypress Vendor')
		company_type = get_field_or_default(form, 'company_type', 'vendor')
		created_at = get_field_or_default(form, 'created_at', date_util.now())
		id = get_field_or_default(form, 'id', None)
		is_cannabis = get_field_or_default(form, 'is_cannabis', True)
		is_deleted = get_field_or_default(form, 'is_deleted', None)
		license_info = get_field_or_default(form, 'license_info', { "license_ids": [ "C11-0000536-LIC" ] })
		request_info = get_field_or_default(form, 'request_info', {
			"dba_name":"CV",
			"bank_name":"Cypress Bank",
			"bank_account_name":"Cypress Checking",
			"bank_account_number":"5582134",
			"bank_account_type":"checking",
			"bank_ach_routing_number":"99687302",
			"bank_wire_routing_number":"165484",
			"beneficiary_address":"123 Main Street, Annapolis, MD 21401",
			"bank_instructions_attachment_id": None
		})
		requested_by_user_id = get_field_or_default(form, 'requested_by_user_id', None)
		requesting_company_id = get_field_or_default(form, 'requesting_company_id', None)
		settled_at = get_field_or_default(form, 'settled_at', None)
		settled_by_user_id = get_field_or_default(form, 'settled_by_user_id', None)
		two_factor_message_method = get_field_or_default(form, 'two_factor_message_method', TwoFactorMessageMethod.PHONE)
		updated_at = get_field_or_default(form, 'updated_at', None)
		user_info = get_field_or_default(form, 'user_info', {
			"first_name":"Oscar",
			"last_name":"the Grouch",
			"email":"do-not-reply-development+oscar@bespokefinancial.com",
			"phone_number":"+1 (240) 601-9166"
		})

		company_partnership_request_id = ''
		with session_scope(session_maker) as session:
			logging.info('Adding company partnership request for cypress test...')

			company_partnership_request, err = seed_util.add_company_partnership_request(
				session,
				company_name = company_name,
				company_type = company_type,
				id = id,
				is_cannabis = is_cannabis,
				is_deleted = is_deleted,
				license_info = license_info,
				request_info = request_info,
				requested_by_user_id = requested_by_user_id,
				requesting_company_id = requesting_company_id,
				settled_at = settled_at,
				settled_by_user_id = settled_by_user_id,
				two_factor_message_method = two_factor_message_method,
				user_info = user_info,
			)
			if err:
				raise err

			company_partnership_request_id = str(company_partnership_request)

			logging.info('Finished adding company partnership request for cypress test...')

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'company_partnership_request_id': company_partnership_request_id,
			},
		}))

class AddCompanySettingsView(MethodView):
	def post(self, **kwargs: Any) -> Response:
		session_maker, err = run_cypress_preflight_checks()
		if err:
			raise err

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response("No data provided")

		id = get_field_or_default(form, 'id', None)
		company_id = get_field_or_default(form, 'company_id', None)
		active_ebba_application_id = get_field_or_default(form, 'active_ebba_application_id', None)
		active_borrowing_base_id = get_field_or_default(form, 'active_borrowing_base_id', None)
		active_financial_report_id = get_field_or_default(form, 'active_financial_report_id', None)
		metrc_api_key_id = get_field_or_default(form, 'metrc_api_key_id', None)
		advances_bespoke_bank_account_id = get_field_or_default(form, 'advances_bespoke_bank_account_id', None)
		collections_bespoke_bank_account_id = get_field_or_default(form, 'collections_bespoke_bank_account_id', None)
		advances_bank_account_id = get_field_or_default(form, 'advances_bank_account_id', None)
		collections_bank_account_id = get_field_or_default(form, 'collections_bank_account_id', None)
		vendor_agreement_docusign_template = get_field_or_default(form, 'vendor_agreement_docusign_template', None)
		payor_agreement_docusign_template = get_field_or_default(form, 'payor_agreement_docusing_template', None)
		vendor_onboarding_link = get_field_or_default(form, 'vendor_onboarding_link', None)
		has_autofinancing = get_field_or_default(form, 'has_autofinancing', False)
		two_factor_message_method = get_field_or_default(form, 'two_factor_message_method', TwoFactorMessageMethod.PHONE)
		feature_flags_payload = get_field_or_default(form, 'feature_flags_payload', {})
		custom_messages_payload = get_field_or_default(form, 'custom_messages_payload', {})
		is_dummy_account = get_field_or_default(form, 'is_dummy_account', False)
		client_success_user_id = get_field_or_default(form, 'client_success_user_id', None)
		business_development_user_id = get_field_or_default(form, 'business_development_user_id', None)
		underwriter_user_id = get_field_or_default(form, 'underwriter_user_id', None)
		is_autogenerate_repayments_enabled = get_field_or_default(form, 'is_autogenerate_repayments_enabled', False)

		company_settings_id = ''
		with session_scope(session_maker) as session:
			logging.info('Adding company settings for cypress test...')

			company_settings, err = seed_util.update_company_settings(
				session,
				id,
				company_id,
				active_ebba_application_id,
				active_borrowing_base_id,
				active_financial_report_id,
				metrc_api_key_id,
				advances_bespoke_bank_account_id,
				collections_bespoke_bank_account_id,
				advances_bank_account_id,
				collections_bank_account_id,
				vendor_agreement_docusign_template,
				payor_agreement_docusign_template,
				vendor_onboarding_link,
				has_autofinancing,
				two_factor_message_method,
				feature_flags_payload,
				custom_messages_payload,
				is_dummy_account,
				client_success_user_id,
				business_development_user_id,
				underwriter_user_id,
				is_autogenerate_repayments_enabled,
			)
			if err:
				raise err

			company_settings_id = str(company_settings.id)
			
			logging.info('Finished adding company settings for cypress test...')

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'company_settings_id': company_settings_id,
			},
		}))

class AddCompanyVendorContactView(MethodView):
	def post(self, **kwargs: Any) -> Response:
		session_maker, err = run_cypress_preflight_checks()
		if err:
			raise err

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response("No data provided")

		id = get_field_or_default(form, 'id', None)
		partnership_id = get_field_or_default(form, 'partnership_id', None)
		vendor_user_id = get_field_or_default(form, 'vendor_user_id', None)
		is_active = get_field_or_default(form, 'is_active', False)
		
		company_vendor_partnership_id = ''
		with session_scope(session_maker) as session:
			logging.info('Adding company vendor contact for cypress test...')

			company_vendor_contact, err = seed_util.create_company_vendor_contact(
				session,
				id,
				partnership_id,
				vendor_user_id,
				is_active,
			)
			if err:
				raise err

			company_vendor_contact_id = str(company_vendor_contact.id)
			
			logging.info('Finished adding company vendor contact for cypress test...')

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'company_vendor_contact_id': company_vendor_contact_id,
			},
		}))

class AddCompanyVendorPartnershipView(MethodView):
	def post(self, **kwargs: Any) -> Response:
		session_maker, err = run_cypress_preflight_checks()
		if err:
			raise err

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response("No data provided")

		approved_at = get_field_or_default(form, 'approved_at', date_util.now())
		company_id = get_field_or_default(form, 'company_id', None)
		created_at = get_field_or_default(form, 'created_at', date_util.now())
		id = get_field_or_default(form, 'id', None)
		updated_at = get_field_or_default(form, 'updated_at', None)
		vendor_agreement_id = get_field_or_default(form, 'vendor_agreement_id', None)
		vendor_bank_id = get_field_or_default(form, 'vendor_bank_id', None)
		vendor_id = get_field_or_default(form, 'vendor_id', None)
		
		company_vendor_partnership_id = ''
		with session_scope(session_maker) as session:
			logging.info('Adding company vendor partnership for cypress test...')

			company_vendor_partnership, err = seed_util.create_company_vendor_partnership_new(
				session,
				approved_at,
				company_id,
				created_at,
				id,
				updated_at,
				vendor_agreement_id,
				vendor_bank_id,
				vendor_id,
			)
			if err:
				raise err

			company_vendor_partnership_id = str(company_vendor_partnership.id)
			
			logging.info('Finished adding company vendor partnership for cypress test...')

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'company_vendor_partnership_id': company_vendor_partnership_id,
			},
		}))

class AddContractView(MethodView):
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		session_maker, err = run_cypress_preflight_checks()
		if err:
			raise err

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response("No data provided")

		id = get_field_or_default(form, 'id', None)
		company_id = get_field_or_default(form, 'company_id', None)
		product_type = get_field_or_default(form, 'product_type', ProductType.INVENTORY_FINANCING)
		start_date = get_field_or_default(form, 'start_date', '2022-01-01')
		end_date = get_field_or_default(form, 'end_date', '2023-01-01')
		adjusted_end_date = get_field_or_default(form, 'adjusted_end_date', '2023-01-01')
		modified_by_user_id = get_field_or_default(form, 'modified_by_user_id', None) 
		terminated_at = get_field_or_default(form, 'terminated_at', None)
		terminated_by_user_id = get_field_or_default(form, 'terminated_by_user_id', None)
		is_deleted = get_field_or_default(form, 'is_deleted', None)
		contract_financing_terms = get_field_or_default(form, 'contract_financing_terms', 90)
		interest_rate = get_field_or_default(form, 'interest_rate', 0.00075)
		advance_rate = get_field_or_default(form, 'advance_rate', 1.0)
		maximum_principal_amount = get_field_or_default(form, 'maximum_principal_amount', 500000.0)
		max_days_until_repayment = get_field_or_default(form, 'max_days_until_repayment', 90)
		late_fee_structure = get_field_or_default(form, 'late_fee_structure', "{'1-14':0.25,'15-29':0.5,'30+':1}")
		dynamic_interest_rate = get_field_or_default(form, 'dynamic_interest_rate', 0.001)
		preceeding_business_day = get_field_or_default(form, 'preceeding_business_day', None)
		minimum_monthly_amount = get_field_or_default(form, 'minimum_monthly_amount', 0)
		minimum_quarterly_amount = get_field_or_default(form, 'minimum_quarterly_amount', 0)
		minimum_annual_amount = get_field_or_default(form, 'minimum_annual_amount', 0)
		factoring_fee_threshold = get_field_or_default(form, 'factoring_fee_threshold', 0)
		factoring_fee_threshold_starting_value = get_field_or_default(form, 'factoring_fee_threshold_starting_value', 0.0)
		adjusted_factoring_fee_percentage = get_field_or_default(form, 'adjusted_factoring_fee_percentage', None)
		wire_fee = get_field_or_default(form, 'wire_fee', 25)
		repayment_type_settlement_timeline = get_field_or_default(form, 'repayment_type_settlement_timeline', "{\"Wire\":1,\"ACH\":1,\"Reverse Draft ACH\":1,\"Check\":1,\"Cash\":1}")
		borrowing_base_accounts_receivable_percentage = get_field_or_default(form, 'borrowing_base_accounts_receivable_percentage', 1.0)
		borrowing_base_inventory_percentage = get_field_or_default(form, 'borrowing_base_inventory_percentage', 1.0)
		borrowing_base_cash_percentage = get_field_or_default(form, 'borrowing_base_cash_percentage', 1.0)
		borrowing_base_cash_in_daca_percentage = get_field_or_default(form, 'borrowing_base_cash_in_daca_percentage', 1.0)

		contract_id = ""
		with session_scope(session_maker) as session:
			logging.info('Adding contract for cypress test...')

			contract, err = seed_util.create_contract(
				session,
				id,
				company_id,
				product_type,
    			start_date,
    			end_date,
    			adjusted_end_date,
				modified_by_user_id, 
				terminated_at,
				terminated_by_user_id,
				is_deleted,
    			contract_financing_terms,
				interest_rate,
				advance_rate,
				maximum_principal_amount,
				max_days_until_repayment,
				late_fee_structure,
				dynamic_interest_rate,
				preceeding_business_day,
				minimum_monthly_amount,
				minimum_quarterly_amount,
				minimum_annual_amount,
				factoring_fee_threshold,
				factoring_fee_threshold_starting_value,
				adjusted_factoring_fee_percentage,
				wire_fee,
				repayment_type_settlement_timeline,
				borrowing_base_accounts_receivable_percentage,
				borrowing_base_inventory_percentage,
				borrowing_base_cash_percentage,
				borrowing_base_cash_in_daca_percentage,
			)
			if err:
				raise err

			contract_id = str(contract.id)

			logging.info('Finished adding contract for cypress test...')

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'contract_id': contract_id,
			},
		}))

class AddEbbaApplicationView(MethodView):
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		session_maker, err = run_cypress_preflight_checks()
		if err:
			raise err
		
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response("No data provided")	

		id = get_field_or_default(form, 'id', None)
		company_id = get_field_or_default(form, 'company_id', None)
		category = get_field_or_default(form, 'category', None)
		status = get_field_or_default(form, 'status', None)
		application_date = get_field_or_default(form, 'application_date', date_util.now_as_date())
		is_deleted = get_field_or_default(form, 'is_deleted', None)
		submitted_by_user_id = get_field_or_default(form, 'submitted_by_user_id', None)
		approved_by_user_id = get_field_or_default(form, 'approved_by_user_id', None)
		rejected_by_user_id = get_field_or_default(form, 'rejected_by_user_id', None)
		monthly_accounts_receivable = get_field_or_default(form, 'monthly_accounts_receivable', 0.0)
		monthly_inventory = get_field_or_default(form, 'monthly_inventory', 0.0)
		monthly_cash = get_field_or_default(form, 'monthly_cash', 0.0)
		amount_cash_in_daca = get_field_or_default(form, 'amount_cash_in_daca', 0.0)
		amount_custom = get_field_or_default(form, 'amount_custom', 0.0)
		amount_custom_note = get_field_or_default(form, 'amount_custom_note', None)
		bank_note = get_field_or_default(form, 'bank_note', None)
		calculated_borrowing_base = get_field_or_default(form, 'calculated_borrowing_base', None)
		rejection_note = get_field_or_default(form, 'rejection_note', None)
		expires_date = get_field_or_default(form, 'expires_date', None)
		requested_at = get_field_or_default(form, 'requested_at', date_util.now())
		approved_at = get_field_or_default(form, 'approved_at', None)
		rejected_at = get_field_or_default(form, 'rejected_at', None)

		with session_scope(session_maker) as session:
			logging.info('Adding ebba application for cypress test...')

			ebba_application, err = seed_util.create_ebba_application(
				session,
				id,
				company_id,
				category,
				status,
				application_date,
				is_deleted,
				submitted_by_user_id,
				approved_by_user_id,
				rejected_by_user_id,
				monthly_accounts_receivable,
				monthly_inventory,
				monthly_cash,
				amount_cash_in_daca,
				amount_custom,
				amount_custom_note,
				bank_note,
				calculated_borrowing_base,
				rejection_note,
				expires_date,
				requested_at,
				approved_at,
				rejected_at,
			)
			if err:
				raise err
			
			ebba_application_id = str(ebba_application.id)

			logging.info('Finished adding ebba application for cypress test...')
		
		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'ebba_application_id': ebba_application_id,
			}
		}))

class AddFileView(MethodView):
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		session_maker, err = run_cypress_preflight_checks()
		if err:
			raise err

		today_string = date_util.date_to_db_str(date_util.now_as_date())
		
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response("No data provided")

		id = get_field_or_default(form, 'id', None)

		company_id = get_field_or_default(form, 'company_id', None)
		created_at = get_field_or_default(form, 'created_at', date_util.now())
		created_by_user_id = get_field_or_default(form, 'created_by_user_id', None)
		extension = get_field_or_default(form, 'extension', 'pdf')
		mime_type = get_field_or_default(form, 'mime_type', 'application/pdf')
		name = get_field_or_default(form, 'name', 'sample.pdf')
		path = get_field_or_default(form, 'path', "not/an/actual/file.pdf")
		sequential_id = get_field_or_default(form, 'sequential_id', None)
		size = get_field_or_default(form, 'size', 3028)
		updated_at = get_field_or_default(form, 'updated_at', date_util.now())

		file_id = ""
		with session_scope(session_maker) as session:
			logging.info('Adding file for cypress test...')

			file, err = seed_util.create_file(
				session,
				id,
				company_id,
				created_at,
				created_by_user_id,
				extension,
				mime_type,
				name,
				path,
				sequential_id,
				size,
				updated_at,
			)
			if err:
				raise err

			file_id = str(file.id)

			logging.info('Finished adding file for cypress test...')

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'file_id': file_id,
			},
		}))

class AddFinancialSummaryView(MethodView):
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		session_maker, err = run_cypress_preflight_checks()
		if err:
			raise err

		today_string = date_util.date_to_db_str(date_util.now_as_date())
		
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response("No data provided")

		id = get_field_or_default(form, 'id', None)
		company_id = get_field_or_default(form, 'company_id', None)
		total_limit = get_field_or_default(form, 'total_limit', 0.0)
		total_outstanding_principal = get_field_or_default(form, 'total_outstanding_principal', 0.0)
		total_outstanding_interest = get_field_or_default(form, 'total_outstanding_interest', 0.0)
		total_principal_in_requested_state = get_field_or_default(form, 'total_principal_in_requested_state', 0.0)
		available_limit = get_field_or_default(form, 'available_limit', 0.0)
		total_outstanding_fees = get_field_or_default(form, 'total_outstanding_fees', 0.0)
		adjusted_total_limit = get_field_or_default(form, 'adjusted_total_limit', 0.0)
		date = date_util.load_date_str(get_field_or_default(form, 'date', today_string))
		total_outstanding_principal_for_interest = get_field_or_default(form, 'total_outstanding_principal_for_interest', 0.0)
		minimum_monthly_payload = get_field_or_default(form, 'minimum_monthly_payload', {})
		account_level_balance_payload = get_field_or_default(form, 'account_level_balance_payload', {})
		day_volume_threshold_met = get_field_or_default(form, 'day_volume_threshold_met', None)
		day_volume_threshold_met = date_util.load_date_str(day_volume_threshold_met) if day_volume_threshold_met is not None else None
		interest_accrued_today = get_field_or_default(form, 'interest_accrued_today', 0.0)
		total_amount_to_pay_interest_on = get_field_or_default(form, 'total_amount_to_pay_interest_on', 0.0)
		product_type = get_field_or_default(form, 'product_type', ProductType.INVENTORY_FINANCING)
		needs_recompute = get_field_or_default(form, 'needs_recompute', False)
		days_to_compute_back = get_field_or_default(form, 'days_to_compute_back', 0.0)
		total_interest_paid_adjustment_today = get_field_or_default(form, 'total_interest_paid_adjustment_today', 0.0)
		total_fees_paid_adjustment_today = get_field_or_default(form, 'total_fees_paid_adjustment_today', 0.0)
		total_outstanding_principal_past_due = get_field_or_default(form, 'total_outstanding_principal_past_due', 0.0)
		daily_interest_rate = get_field_or_default(form, 'daily_interest_rate', 0.0008)
		minimum_interest_duration = get_field_or_default(form, 'minimum_interest_duration', None)
		minimum_interest_amount = get_field_or_default(form, 'minimum_interest_amount', 0.0)
		minimum_interest_remaining = get_field_or_default(form, 'minimum_interest_remaining', 0.0)
		most_overdue_loan_days = get_field_or_default(form, 'most_overdue_loan_days', None)
		late_fees_accrued_today = get_field_or_default(form, 'late_fees_accrued_today', 0.0)
		loans_info = get_field_or_default(form, 'loan_info', {})

		financial_summary_id = ""
		with session_scope(session_maker) as session:
			logging.info('Adding financial summary for cypress test...')

			financial_summary, err = seed_util.create_financial_summary(
				session,
				id,
				company_id,
				total_limit,
				total_outstanding_principal,
				total_outstanding_interest,
				total_principal_in_requested_state,
				available_limit,
				total_outstanding_fees,
				adjusted_total_limit,
				date,
				total_outstanding_principal_for_interest,
				minimum_monthly_payload,
				account_level_balance_payload,
				day_volume_threshold_met,
				interest_accrued_today,
				total_amount_to_pay_interest_on,
				product_type,
				needs_recompute,
				days_to_compute_back,
				total_interest_paid_adjustment_today,
				total_fees_paid_adjustment_today,
				total_outstanding_principal_past_due,
				daily_interest_rate,
				minimum_interest_duration,
				minimum_interest_amount,
				minimum_interest_remaining,
				most_overdue_loan_days,
				late_fees_accrued_today,
				loans_info,
			)
			if err:
				raise err

			financial_summary_id = str(financial_summary.id)

			logging.info('Finished adding financial summary for cypress test...')

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'financial_summary_id': financial_summary_id,
			},
		}))

class AddLoanView(MethodView):
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		session_maker, err = run_cypress_preflight_checks()
		if err:
			raise err
		
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response("No data provided")

		id = get_field_or_default(form, 'id', None)
		company_id = get_field_or_default(form, 'company_id', None)
		loan_report_id = get_field_or_default(form, 'loan_report_id', None)
		created_at = get_field_or_default(form, 'created_at', date_util.now())
		updated_at = get_field_or_default(form, 'updated_at', date_util.now())
		identifier = get_field_or_default(form, 'identifier', None)
		disbursement_identifier = get_field_or_default(form, 'disbursement_identifier', None)
		loan_type = get_field_or_default(form, 'loan_type', None)
		artifact_id = get_field_or_default(form, 'artifact_id', None)
		requested_payment_date = get_field_or_default(form, 'requested_payment_date', None)
		origination_date = get_field_or_default(form, 'origination_date', None)
		maturity_date = get_field_or_default(form, 'maturity_date', None)
		adjusted_maturity_date = get_field_or_default(form, 'adjusted_maturity_date', None)
		amount = get_field_or_default(form, 'amount', None)
		status = get_field_or_default(form, 'status', None)
		payment_status = get_field_or_default(form, 'payment_status', None)
		notes = get_field_or_default(form, 'notes', None)
		customer_notes = get_field_or_default(form, 'customer_notes', None)
		requested_at = get_field_or_default(form, 'requested_at', None)
		requested_by_user_id = get_field_or_default(form, 'requested_by_user_id', None)
		closed_at = get_field_or_default(form, 'closed_at', None)
		rejected_at = get_field_or_default(form, 'rejected_at', None)
		rejected_by_user_id = get_field_or_default(form, 'rejected_by_user_id', None)
		rejection_note = get_field_or_default(form, 'rejection_note', None)
		approved_at = get_field_or_default(form, 'approved_at', None)
		approved_by_user_id = get_field_or_default(form, 'approved_by_user_id', None)
		funded_at = get_field_or_default(form, 'funded_at', None)
		funded_by_user_id = get_field_or_default(form, 'funded_by_user_id', None)
		outstanding_principal_balance = get_field_or_default(form, 'outstanding_principal_balance', 0.0)
		outstanding_interest = get_field_or_default(form, 'outstanding_interest', 0.0)
		outstanding_fees = get_field_or_default(form, 'outstanding_fees', 0.0)
		is_deleted = get_field_or_default(form, 'is_deleted', None)
		is_frozen = get_field_or_default(form, 'is_frozen', None)

		with session_scope(session_maker) as session:
			logging.info('Adding loan for cypress test...')

			loan, err = seed_util.create_loan(
				session,
				id,
				company_id,
				loan_report_id,
				created_at,
				updated_at,
				identifier,
				disbursement_identifier,
				loan_type,
				artifact_id,
				requested_payment_date,
				origination_date,
				maturity_date,
				adjusted_maturity_date,
				amount,
				status,
				payment_status,
				notes,
				customer_notes,
				requested_at,
				requested_by_user_id,
				closed_at,
				rejected_at,
				rejected_by_user_id,
				rejection_note,
				approved_at,
				approved_by_user_id,
				funded_at,
				funded_by_user_id,
				outstanding_principal_balance,
				outstanding_interest,
				outstanding_fees,
				is_deleted,
				is_frozen,
			)
			if err:
				raise err
			
			loan_id = str(loan.id)

			logging.info('Finished adding loan for cypress test...')
		  
		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'loan_id': loan_id,
			}
		}))

class addPaymentView(MethodView):
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		session_maker, err = run_cypress_preflight_checks()
		if err:
			raise err
		
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response("No data provided")	

		id = get_field_or_default(form, 'id', None)
		amount = get_field_or_default(form, 'amount', 0.0)
		type = get_field_or_default(form, 'type', None)
		company_id = get_field_or_default(form, 'company_id', None)
		method = get_field_or_default(form, 'method', None)
		company_bank_account_id = get_field_or_default(form, 'company_bank_account_id', None)
		submitted_at = get_field_or_default(form, 'submitted_at', None)
		settled_at = get_field_or_default(form, 'settled_at', None)
		items_covered = get_field_or_default(form, 'items_covered', None)
		settlement_date = get_field_or_default(form, 'settlement_date', None)
		payment_date = get_field_or_default(form, 'payment_date', None)
		submitted_by_user_id = get_field_or_default(form, 'submitted_by_user_id', None)
		settled_by_user_id = get_field_or_default(form, 'settled_by_user_id', None)
		requested_by_user_id = get_field_or_default(form, 'requested_by_user_id', None)
		created_at = get_field_or_default(form, 'created_at', None)
		updated_at = get_field_or_default(form, 'updated_at', None)
		deposit_date = get_field_or_default(form, 'deposit_date', None)
		requested_amount = get_field_or_default(form, 'requested_amount', None)
		originating_payment_id = get_field_or_default(form, 'originating_payment_id', None)
		is_deleted = get_field_or_default(form, 'is_deleted', False)
		settlement_identifier = get_field_or_default(form, 'settlement_identifier', None)
		customer_note = get_field_or_default(form, 'customer_note', None)
		bank_note = get_field_or_default(form, 'bank_note', None)
		reversed_at = get_field_or_default(form, 'reversed_at', None)
		recipient_bank_account_id = get_field_or_default(form, 'recipient_bank_account_id', None)

		with session_scope(session_maker) as session:
			logging.info('Adding payment for cypress test...')

			payment, err = seed_util.create_payment(
				session,
				id,
				amount,
				type,
				company_id,
				method,
				company_bank_account_id,
				submitted_at,
				settled_at,
				items_covered,
				settlement_date,
				payment_date,
				submitted_by_user_id,
				settled_by_user_id,
				requested_by_user_id,
				created_at,
				updated_at,
				deposit_date,
				requested_amount,
				originating_payment_id,
				is_deleted,
				settlement_identifier,
				customer_note,
				bank_note,
				reversed_at,
				recipient_bank_account_id,
			)
			if err:
				raise err
			
			payment_id = str(payment.id)

			logging.info('Finished adding payment for cypress test...')
		
		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'payment_id': payment_id,
			}
		}))
		
class AddPurchaseOrderView(MethodView):
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		session_maker, err = run_cypress_preflight_checks()
		if err:
			raise err
		
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response("No data provided")

		# Get optional fields
		clear_approved_at = form['clear_approved_at'] if 'clear_approved_at' in form else False

		all_bank_notes = get_field_or_default(form, 'all_bank_notes', {})
		all_customer_notes = get_field_or_default(form, 'all_customer_notes', {})
		amount = get_field_or_default(form, 'amount', 1000.00)
		amount_funded = get_field_or_default(form, 'amount_funded', 0.0)
		amount_updated_at = get_field_or_default(form, 'amount_updated_at', None)
		approved_at = get_field_or_default(form, 'approved_at', date_util.now() if clear_approved_at is False else None)
		approved_by_user_id = get_field_or_default(form, 'approved_by_user_id', None)
		bank_incomplete_note = get_field_or_default(form, 'bank_incomplete_note', None)
		bank_note = get_field_or_default(form, 'bank_note', None)
		bank_rejection_note = get_field_or_default(form, 'bank_rejection_note', None)
		closed_at = get_field_or_default(form, 'closed_at', None)
		company_id = get_field_or_default(form, 'company_id', None)
		customer_note = get_field_or_default(form, 'customer_note', None)
		delivery_date = get_field_or_default(form, 'delivery_date', None)
		funded_at = get_field_or_default(form, 'funded_at', None)
		history = get_field_or_default(form, 'history', [])
		id = get_field_or_default(form, 'id', None)
		incompleted_at = get_field_or_default(form, 'incompleted_at', None)
		is_cannabis = get_field_or_default(form, 'is_cannabis', True)
		is_deleted = get_field_or_default(form, 'is_deleted', None)
		is_metrc_based = get_field_or_default(form, 'is_metrc_based', False)
		net_terms = get_field_or_default(form, 'net_terms', 60)
		new_purchase_order_status = get_field_or_default(form, 'new_purchase_order_status', NewPurchaseOrderStatus.DRAFT)
		order_date = get_field_or_default(form, 'order_date', date_util.now_as_date())
		order_number = get_field_or_default(form, 'order_number', "Cypress-1")
		rejected_at = get_field_or_default(form, 'rejected_at', None)
		rejected_by_user_id = get_field_or_default(form, 'rejected_by_user_id', None)
		rejection_note = get_field_or_default(form, 'rejection_note', None)
		requested_at = get_field_or_default(form, 'requested_at', date_util.now())
		status = get_field_or_default(form, 'status', RequestStatusEnum.DRAFTED)
		vendor_id = get_field_or_default(form, 'vendor_id', None)

		purchase_order_id = ''
		with session_scope(session_maker) as session:
			logging.info('Adding purchase order for cypress test...')

			purchase_order, err = seed_util.create_purchase_order(
				session,
				all_bank_notes,
				all_customer_notes,
				amount,
				amount_funded,
				amount_updated_at,
				approved_at,
				approved_by_user_id,
				bank_incomplete_note,
				bank_note,
				bank_rejection_note,
				closed_at,
				company_id,
				customer_note,
				delivery_date,
				funded_at,
				history,
				id,
				incompleted_at,
				is_cannabis,
				is_deleted,
				is_metrc_based,
				net_terms,
				new_purchase_order_status,
				order_date,
				order_number,
				rejected_at,
				rejected_by_user_id,
				rejection_note,
				requested_at,
				status,
				vendor_id,
			)
			if err:
				raise err

			purchase_order_id = str(purchase_order.id)

			logging.info('Finished adding purchase order for cypress test...')

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'purchase_order_id': purchase_order_id,
			},
		}))

class AddPurchaseOrderFileView(MethodView):
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		session_maker, err = run_cypress_preflight_checks()
		if err:
			raise err
		
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response("No data provided")

		id = get_field_or_default(form, 'id', None)
		created_at = get_field_or_default(form, 'created_at', date_util.now())
		file_id = get_field_or_default(form, 'file_id', None)
		file_type = get_field_or_default(form, 'file_type', PurchaseOrderFileTypeEnum.PURCHASE_ORDER)
		purchase_order_id = get_field_or_default(form, 'purchase_order_id', None)
		updated_at = get_field_or_default(form, 'updated_at', date_util.now())

		purchase_order_file_id = ''
		with session_scope(session_maker) as session:
			logging.info('Adding purchase order file for cypress test...')

			purchase_order_file, err = seed_util.create_purchase_order_file(
				session,
				created_at,
				file_id,
				file_type,
				purchase_order_id,
				updated_at,
			)
			if err:
				raise err

			# Please note! This table doesn't have an `id` column, so we are
			# returning `file_id` in case that would be useful for verification
			purchase_order_file_id = str(purchase_order_file.file_id)

			logging.info('Finished adding purchase order file for cypress test...')

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'purchase_order_file_id': purchase_order_file_id,
			},
		}))

class AddTwoFactorLinkView(MethodView):
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		session_maker, err = run_cypress_preflight_checks()
		if err:
			raise err
		
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response("No data provided")

		expires_at_input = date_util.datetime_to_str(
			datetime.combine(
				date_util.add_biz_days(date_util.now_as_date(), 365),
				datetime.min.time()
			)
		)

		# Optional parameters need to be set first in order to pass to form_info and token_states
		purchase_order_id = get_field_or_default(form, 'purchase_order_id', None)
		form_type = get_field_or_default(form, 'form_type', 'confirm_purchase_order')
		form_payload_key = get_field_or_default(form, 'id', 'purchase_order_id')
		vendor_email = get_field_or_default(form, 'id', 'vendor@bespokefinancial.com')

		# These are the fields actually in models.TwoFactorLink
		id = get_field_or_default(form, 'id', None)
		expires_at = get_field_or_default(form, 'expires_at', expires_at_input)
		default_form_info = {
			"type": form_type,
			"payload": { }
		}
		default_form_info["payload"][form_payload_key] = purchase_order_id
		form_info = get_field_or_default(form, 'form_info', default_form_info)
		default_token_states = {}
		default_token_states[vendor_email] = {
			"token_val":"103580",
			"expires_in": expires_at_input,
		}
		token_states = get_field_or_default(form, 'token_states', default_token_states)

		two_factor_link_id = ''
		with session_scope(session_maker) as session:
			logging.info('Adding two factor link for cypress test...')

			two_factor_link, err = seed_util.create_two_factor_link(
				session,
				id,
				expires_at,
				form_info,
				token_states,
			)
			if err:
				raise err

			two_factor_link_id = str(two_factor_link.id)

			logging.info('Finished adding two factor link for cypress test...')

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'two_factor_link_id': two_factor_link_id,
			},
		}))

class AddUserView(MethodView):
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		session_maker, err = run_cypress_preflight_checks()
		if err:
			raise err
		
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response("No data provided")

		id = get_field_or_default(form, 'id', None)
		parent_company_id = get_field_or_default(form, 'parent_company_id', None)
		company_id = get_field_or_default(form, 'company_id', None)
		email = get_field_or_default(form, 'email', 'do-not-reply-development@bespokefinancial.com')
		password = get_field_or_default(form, 'password', 'Password123!')
		role = get_field_or_default(form, 'role', None)
		company_role = get_field_or_default(form, 'company_role', None)
		company_role_new = get_field_or_default(form, 'company_role_new', {})
		first_name = get_field_or_default(form, 'first_name', 'Oscar')
		last_name = get_field_or_default(form, 'last_name', 'the Grouch')
		phone_number = get_field_or_default(form, 'phone_number', '3010987654')
		is_deleted = get_field_or_default(form, 'is_deleted', None)
		login_method = get_field_or_default(form, 'login_method', LoginMethod.TWO_FA)

		user_id = ''
		user_email = ''
		with session_scope(session_maker) as session:
			logging.info('Adding user for cypress test...')

			user, err = seed_util.create_user(
				session,
				id,
				parent_company_id,
				company_id,
				email,
				password,
				role,
				company_role,
				company_role_new,
				first_name,
				last_name,
				phone_number,
				is_deleted,
				login_method,
			)
			if err:
				raise err

			user_id = str(user.id)
			user_email = user.email

			logging.info('Finished adding user for cypress test...')

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'user_id': user_id,
				'user_email': user_email,
				'user_password': password,
			},
		}))

handler.add_url_rule(
	'/reset_database',
	view_func=ResetDatabaseView.as_view(name='reset_database_view'),
)

handler.add_url_rule(
	'/add_bank_account',
	view_func=AddBankAccountView.as_view(name='add_bank_account_view'),
)

handler.add_url_rule(
	'/add_company',
	view_func=AddCompanyView.as_view(name='add_company_view'),
)

handler.add_url_rule(
	'/add_company_license',
	view_func=AddCompanyLicenseView.as_view(name='add_company_license_view'),
)

handler.add_url_rule(
	'/add_company_partnership_request',
	view_func=AddCompanyPartnershipRequestView.as_view(name='add_company_partnership_request_view'),
)

handler.add_url_rule(
	'/add_company_settings',
	view_func=AddCompanySettingsView.as_view(name='add_company_settings_view'),
)

handler.add_url_rule(
	'/add_company_vendor_contact',
	view_func=AddCompanyVendorContactView.as_view(name='add_company_vendor_contact_view'),
)

handler.add_url_rule(
	'/add_company_vendor_partnership',
	view_func=AddCompanyVendorPartnershipView.as_view(name='add_company_vendor_partnership_view'),
)

handler.add_url_rule(
	'/add_contract',
	view_func=AddContractView.as_view(name='add_contract_view'),
)

handler.add_url_rule(
	'/add_file',
	view_func=AddFileView.as_view(name='add_file_view'),
)

handler.add_url_rule(
	'/add_financial_summary',
	view_func=AddFinancialSummaryView.as_view(name='add_financial_summary_view'),
)

handler.add_url_rule(
	'/add_purchase_order',
	view_func=AddPurchaseOrderView.as_view(name='add_purchase_order_view'),
)

handler.add_url_rule(
	'/add_purchase_order_file',
	view_func=AddPurchaseOrderFileView.as_view(name='add_purchase_order_file_view'),
)

handler.add_url_rule(
	'/add_two_factor_link',
	view_func=AddTwoFactorLinkView.as_view(name='add_two_factor_link_view'),
)

handler.add_url_rule(
	'/add_user',
	view_func=AddUserView.as_view(name='add_user_view'),
)

handler.add_url_rule(
	'/add_loan',
	view_func=AddLoanView.as_view(name='add_loan_view'),
)

handler.add_url_rule(
	'/add_ebba_application',
	view_func=AddEbbaApplicationView.as_view(name='add_ebba_application_view'),
)

handler.add_url_rule(
	'/add_payment',
	view_func=addPaymentView.as_view(name='add_payment_view'),
)
