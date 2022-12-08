
from typing import Collection, Dict, Optional, Tuple, cast, Union, Dict, List
from bespoke.date import date_util
from bespoke.db import models, queries
from sqlalchemy.orm.session import Session

from bespoke import errors
from mypy_extensions import TypedDict

BankAccountInputDict = TypedDict('BankAccountInputDict', {
	'company_id': Optional[str],
	'bank_name': str,
	'account_title': str,
	'account_type': str,
	'account_number': str,
	'can_ach': bool,
	'routing_number': str,
	'ach_default_memo': str,
	'can_wire': bool,
	'is_wire_intermediary': bool,
	'is_bank_international': bool,
	'intermediary_bank_name': str,
	'intermediary_bank_address': str, 
	'intermediary_account_name': str, 
	'intermediary_account_number': str,
	'wire_routing_number': str,
	'recipient_address': str,
	'recipient_address_2': str,
	'wire_default_memo': str,
	'bank_address': str,
	'is_cannabis_compliant': bool,
	'verified_date': str,
	'verified_at': str
})

def is_bank_account_info_valid(is_bank_admin: bool, bank_account_input: BankAccountInputDict) -> Union[str, None]:
	can_ach = bank_account_input['can_ach']
	can_wire = bank_account_input['can_wire']

	# Checks that basic bank account info is valid
	if bank_account_input["bank_name"] is None:
		return "Bank name is required"
	if bank_account_input["account_title"] is None:
		return "Bank account name is required"
	if bank_account_input["account_type"] is None:
		return "Bank account type is required"
	if bank_account_input["account_number"] is None:
		return "Bank account number is required"
	
	# Checks that either ACH or Wire is selected
	if can_ach is False and can_wire is False:
		return "Bank accounts must be able to either ACH or wire"

	# Checks that ACH info is valid
	if can_ach:
		if bank_account_input['routing_number'] is None:
			return "ACH routing number is required"

	# Checks that Wire info is valid
	if can_wire:
		if bank_account_input['wire_routing_number'] is None:
			return "Wire routing number is required"
		if bank_account_input['recipient_address'] is None:
			return "Wire recipient address is required"
		# if bank_account_input['recipient_address_2'] is None:
		# 	return "Wire recipient address 2 is required"

	# Checks that wire intermediary bank info is valid
	if bank_account_input['is_wire_intermediary']:
		if bank_account_input['intermediary_bank_name'] is None:
			return "Intermediary bank name is required"
		if bank_account_input['intermediary_bank_address'] is None:
			return "Intermediary bank address is required"
		if bank_account_input['intermediary_account_name'] is None:
			return "Intermediary account name is required"
		if bank_account_input['intermediary_account_number'] is None:
			return "Intermediary account number is required"
	
	if bank_account_input["verified_date"] and bank_account_input["verified_at"] is None:
		return "Verified date is required for verified bank accounts"
	if bank_account_input["verified_at"] and bank_account_input["verified_date"] is None:
		return "Verified at is required for verified bank accounts"

	return None

def add_bank_account(
	session: Session,
	user: models.User,
	is_bank_admin: bool,
	bank_account_input: BankAccountInputDict,
	company_id: Optional[str]
) -> Tuple[Dict[str, Collection[str]], errors.Error]:
	company = None
	if company_id is not None:
		# When a bank account is set up for Bespoke itself, there
		# won't be a company_id. Otherwise, we should check to ensure
		# the company exists
		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.id == company_id
			).first())

		if not company:
			return None, errors.Error("Could not find requested company")
	
	error = is_bank_account_info_valid(is_bank_admin, bank_account_input)

	if (error):
		return None, errors.Error(error)

	session.add(models.BankAccount( # type: ignore
		company_id = company_id,
		bank_name = bank_account_input['bank_name'],
		account_title = bank_account_input['account_title'],
		account_type = bank_account_input['account_type'],
		account_number = bank_account_input['account_number'],
		can_ach = bank_account_input['can_ach'],
		routing_number = bank_account_input['routing_number'],
		ach_default_memo = bank_account_input['ach_default_memo'],
		can_wire = bank_account_input['can_wire'],
		is_wire_intermediary = bank_account_input['is_wire_intermediary'],
		is_bank_international = bank_account_input['is_bank_international'],
		intermediary_bank_name = bank_account_input['intermediary_bank_name'],
		intermediary_bank_address = bank_account_input['intermediary_bank_address'], 
		intermediary_account_name = bank_account_input['intermediary_account_name'], 
		intermediary_account_number = bank_account_input['intermediary_account_number'],
		wire_routing_number = bank_account_input['wire_routing_number'],
		recipient_address = bank_account_input['recipient_address'],
		recipient_address_2 = bank_account_input['recipient_address_2'],
		wire_default_memo = bank_account_input['wire_default_memo'],
		bank_address = bank_account_input['bank_address'],
		is_cannabis_compliant = bank_account_input['is_cannabis_compliant'],
		verified_date = date_util.load_date_str(bank_account_input['verified_date']) \
			if 'verified_date' in bank_account_input and bank_account_input['verified_date'] is not None \
			else None,
		verified_at = date_util.now() if 'verified_at' in bank_account_input and bank_account_input['verified_at'] is not None \
			else None
	))

	last_four = bank_account_input['account_number'][-4:] if bank_account_input['account_number'] else ""
	today_date = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)

	template_data = {
		"company_name": company.name if company_id is not None else "Bespoke Financial",
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

	company = None
	if existing_bank_account.company_id is not None:
		# When a bank account is set up for Bespoke itself, there
		# won't be a company_id. Otherwise, we should check to ensure
		# the company exists
		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.id == existing_bank_account.company_id
			).first())

		if not company:
			return None, errors.Error("Could not find the company associated with this bank account")

	if not is_bank_admin and existing_bank_account.verified_at is not None:
		return None, errors.Error("Only bank admins may update verified bank accounts")

	error = is_bank_account_info_valid(is_bank_admin, bank_account_input)

	if (error):
		return None, errors.Error(error)

	existing_bank_account.bank_name = bank_account_input['bank_name']
	existing_bank_account.account_title = bank_account_input['account_title']
	existing_bank_account.account_type = bank_account_input['account_type']
	existing_bank_account.account_number = bank_account_input['account_number']
	existing_bank_account.can_ach = bool(bank_account_input['can_ach'])
	existing_bank_account.routing_number = bank_account_input['routing_number']
	existing_bank_account.ach_default_memo = bank_account_input['ach_default_memo']
	existing_bank_account.can_wire = bool(bank_account_input['can_wire'])
	existing_bank_account.is_wire_intermediary = bool(bank_account_input['is_wire_intermediary'])
	existing_bank_account.is_bank_international = bool(bank_account_input['is_bank_international'])
	existing_bank_account.intermediary_bank_name = bank_account_input['intermediary_bank_name']
	existing_bank_account.intermediary_bank_address = bank_account_input['intermediary_bank_address']
	existing_bank_account.intermediary_account_name = bank_account_input['intermediary_account_name']
	existing_bank_account.intermediary_account_number = bank_account_input['intermediary_account_number']
	existing_bank_account.wire_routing_number = bank_account_input['wire_routing_number']
	existing_bank_account.recipient_address = bank_account_input['recipient_address']
	existing_bank_account.recipient_address_2 = bank_account_input['recipient_address_2']
	existing_bank_account.wire_default_memo = bank_account_input['wire_default_memo']
	existing_bank_account.bank_address = bank_account_input['bank_address']
	existing_bank_account.is_cannabis_compliant = bank_account_input['is_cannabis_compliant']
	existing_bank_account.verified_date = date_util.load_date_str(bank_account_input['verified_date']) \
		if 'verified_date' in bank_account_input and bank_account_input['verified_date'] is not None \
		else None
	existing_bank_account.verified_at = date_util.now() \
		if 'verified_at' in bank_account_input and bank_account_input['verified_at'] is not None \
		else None

	last_four = existing_bank_account.account_number[-4:] if existing_bank_account.account_number else ""
	today_date = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)

	template_data = {
	    "company_name": company.name if existing_bank_account.company_id is not None else "Bespoke Financial",
	    "requesting_user": f"{user.first_name} {user.last_name}",
	    "account_last_four": last_four,
	    "change_date": date_util.date_to_str(today_date),
	    "message_type": {
	        "is_update": True,
	        "is_create": False
	    }
	}

	return template_data, None

def update_bank_for_partnerships(
	session: Session,
    bank_account_id: str,
    vendor_id: str,
) -> Tuple[bool, errors.Error]:
	
	bank_account = cast(
		List[models.BankAccount],
		session.query(models.BankAccount).filter(
			models.BankAccount.id == bank_account_id
		).all())

	if bank_account == None:
		return False, errors.Error("Can not find bank account with specified id")

	company_vendor_partnerships, err = queries.get_company_vendor_partnerships_by_vendor_id(session, vendor_id)

	if err:
		return False, err
	for partnership in company_vendor_partnerships:
		partnership.vendor_bank_id = bank_account_id
	return True, None

