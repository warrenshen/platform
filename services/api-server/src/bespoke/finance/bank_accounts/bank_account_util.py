import base64
import datetime
import json
import logging
import os
import requests
import time
from typing import Any, Callable, Collection, Dict, Iterable, List, Optional, Tuple, cast
from typing import Dict
from flask import current_app
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import (CompanyDebtFacilityStatus, DebtFacilityEventCategory, 
	LoanDebtFacilityStatus, ProductType, DebtFacilityCapacityTypeEnum)
from sendgrid.helpers.mail import Attachment, FileContent, FileName, FileType, Disposition
from sqlalchemy import and_
from sqlalchemy.orm.session import Session

from bespoke import errors
from bespoke.config.config_util import is_prod_env
from bespoke.metrc.common.metrc_common_util import chunker
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import auth_util

BankAccountInputDict = TypedDict('BankAccountInputDict', {
	'company_id': Optional[str],
	'bank_name': str,
	'account_title': str,
	'account_type': str,
	'account_number': str,
	'can_ach': bool,
	'routing_number': str,
	'ach_default_memo': str,
	'torrey_pines_template_name': str,
	'can_wire': bool,
	'is_wire_intermediary': bool,
	'intermediary_bank_name': str,
	'intermediary_bank_address': str, 
	'intermediary_account_name': str, 
	'intermediary_account_number': str,
	'wire_routing_number': str,
	'recipient_address': str,
	'recipient_address_2': str,
	'wire_default_memo': str,
	'wire_template_name': str,
	'bank_address': str,
	'is_cannabis_compliant': bool,
	'verified_date': str,
	'verified_at': str
})

def add_bank_account(
	session: Session,
	user: models.User,
	bank_account_input: BankAccountInputDict,
	company_id: str
) -> Tuple[Dict[str, Collection[str]], errors.Error]:
	company = cast(
		models.Company,
		session.query(models.Company).filter(
			models.Company.id == company_id
		).first())

	if not company:
		return None, errors.Error("Could not find requested company")

	session.add(models.BankAccount( # type: ignore
		company_id = company_id,
		bank_name = bank_account_input['bank_name'],
		account_title = bank_account_input['account_title'],
		account_type = bank_account_input['account_type'],
		account_number = bank_account_input['account_number'],
		can_ach = bank_account_input['can_ach'],
		routing_number = bank_account_input['routing_number'],
		ach_default_memo = bank_account_input['ach_default_memo'],
		torrey_pines_template_name = bank_account_input['torrey_pines_template_name'] \
			if 'torrey_pines_template_name' in bank_account_input else None,
		can_wire = bank_account_input['can_wire'],
		is_wire_intermediary = bank_account_input['is_wire_intermediary'],
		intermediary_bank_name = bank_account_input['intermediary_bank_name'],
		intermediary_bank_address = bank_account_input['intermediary_bank_address'], 
		intermediary_account_name = bank_account_input['intermediary_account_name'], 
		intermediary_account_number = bank_account_input['intermediary_account_number'],
		wire_routing_number = bank_account_input['wire_routing_number'],
		recipient_address = bank_account_input['recipient_address'],
		recipient_address_2 = bank_account_input['recipient_address_2'],
		wire_default_memo = bank_account_input['wire_default_memo'],
		wire_template_name = bank_account_input['wire_template_name'] \
			if 'wire_template_name' in bank_account_input else None,
		bank_address = bank_account_input['bank_address'],
		is_cannabis_compliant = bank_account_input['is_cannabis_compliant'],
		verified_date = date_util.load_date_str(bank_account_input['verified_date']) \
			if 'verified_date' in bank_account_input and bank_account_input['verified_date'] is not None \
			else None,
		verified_at = date_util.now() if 'verified_date' in bank_account_input \
			else None
	))

	last_four = bank_account_input['account_number'][-4:] if bank_account_input['account_number'] else ""
	today_date = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)

	template_data = {
		"company_name": company.name,
		"requesting_user": f"{user.first_name} {user.last_name}",
		"account_last_four": last_four,
		"change_date": date_util.date_to_str(today_date),
		"message_type": {
			"is_update": False,
			"is_create": True
		}
	}

	return template_data, None

def update_bank_account(
	session: Session,
	user: models.User,
	is_bank_admin: bool,
	bank_account_input: BankAccountInputDict,
	bank_account_id: str
) -> Tuple[Dict[str, Collection[str]], errors.Error]:
	existing_bank_account = cast(
		models.BankAccount,
		session.query(models.BankAccount).filter(
			models.BankAccount.id == bank_account_id
		).first())

	if not existing_bank_account:
		return None, errors.Error("Could not find the bank account selected for updating")

	company = cast(
		models.Company,
		session.query(models.Company).filter(
			models.Company.id == existing_bank_account.company_id
		).first())

	if not company:
		return None, errors.Error("Could not find the company associated with this bank account")

	if not is_bank_admin and existing_bank_account.verified_at is not None:
		return None, errors.Error("Only bank admins may update verified bank accounts")

	existing_bank_account.bank_name = bank_account_input['bank_name']
	existing_bank_account.account_title = bank_account_input['account_title']
	existing_bank_account.account_type = bank_account_input['account_type']
	existing_bank_account.account_number = bank_account_input['account_number']
	existing_bank_account.can_ach = bool(bank_account_input['can_ach'])
	existing_bank_account.routing_number = bank_account_input['routing_number']
	existing_bank_account.ach_default_memo = bank_account_input['ach_default_memo']
	existing_bank_account.torrey_pines_template_name = bank_account_input['torrey_pines_template_name'] \
		if 'torrey_pines_template_name' in bank_account_input else None
	existing_bank_account.can_wire = bool(bank_account_input['can_wire'])
	existing_bank_account.is_wire_intermediary = bool(bank_account_input['is_wire_intermediary'])
	existing_bank_account.intermediary_bank_name = bank_account_input['intermediary_bank_name']
	existing_bank_account.intermediary_bank_address = bank_account_input['intermediary_bank_address']
	existing_bank_account.intermediary_account_name = bank_account_input['intermediary_account_name']
	existing_bank_account.intermediary_account_number = bank_account_input['intermediary_account_number']
	existing_bank_account.wire_routing_number = bank_account_input['wire_routing_number']
	existing_bank_account.recipient_address = bank_account_input['recipient_address']
	existing_bank_account.recipient_address_2 = bank_account_input['recipient_address_2']
	existing_bank_account.wire_default_memo = bank_account_input['wire_default_memo']
	existing_bank_account.wire_template_name = bank_account_input['wire_template_name'] \
		if 'wire_template_name' in bank_account_input else None
	existing_bank_account.bank_address = bank_account_input['bank_address']
	existing_bank_account.is_cannabis_compliant = bank_account_input['is_cannabis_compliant']
	existing_bank_account.verified_date = date_util.load_date_str(bank_account_input['verified_date']) \
		if 'verified_date' in bank_account_input and bank_account_input['verified_date'] is not None \
		else None
	existing_bank_account.verified_at = date_util.now() if 'verified_date' in bank_account_input \
		else existing_bank_account.verified_at

	last_four = existing_bank_account.account_number[-4:] if existing_bank_account.account_number else ""
	today_date = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)

	template_data = {
	    "company_name": company.name,
	    "requesting_user": f"{user.first_name} {user.last_name}",
	    "account_last_four": last_four,
	    "change_date": date_util.date_to_str(today_date),
	    "message_type": {
	        "is_update": True,
	        "is_create": False
	    }
	}

	return template_data, None
