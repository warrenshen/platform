"""
	A file that contains some helpers needed to construct certain types or perform some
	common operations on models.py
"""
from typing import Callable, Union, List, Iterable, Tuple, cast, Any
from uuid import UUID

from bespoke import errors
from bespoke.db import db_constants, models
from bespoke.finance.types.payment_types import PaymentItemsCoveredDict
from fastapi_utils.guid_type import GUID
from sqlalchemy.sql import or_, and_
from sqlalchemy.orm.session import Session

def chunker(seq: List, size: int) -> Iterable[List]:
	return (seq[pos:pos + size] for pos in range(0, len(seq), size))

def get_active_users(
	company_id: Union[GUID, str], 
	session: Session, 
	filter_contact_only: bool = False
) -> List[models.User]:
	company = cast(
		models.Company,
		session.query(models.Company).filter_by(
			id=company_id
		).first())

	return cast(
		List[models.User],
		session.query(models.User).filter_by(
			parent_company_id=company.parent_company_id
		).filter(
			cast(Callable, models.User.is_deleted.isnot)(True)
		).filter(
			or_( # If filter_contact_only set to False, treat this filter as passthrough
				and_(
					filter_contact_only == True,
					models.User.role != "company_contact_only"
				),
				filter_contact_only == False
			)
		).all())

def get_licenses_base_query(session: Session) -> Any:
	return session.query(models.CompanyLicense).filter(
		cast(Callable, models.CompanyLicense.is_deleted.isnot)(True)
	)

def get_augmented_transactions(
	transactions: List[models.TransactionDict],
	payments: List[models.PaymentDict],
) -> Tuple[List[models.AugmentedTransactionDict], errors.Error]:
		id_to_payment = {}
		for payment in payments:
			id_to_payment[payment['id']] = payment

		augmented_transactions = []
		for t in transactions:
			if t['payment_id'] not in id_to_payment:
				return None, errors.Error(
					'[DATA ERROR]: Transaction {} is missing an associated payment'.format(t['id']))

			payment_dict = id_to_payment[t['payment_id']]
			deposit_date = payment_dict['deposit_date']
			settlement_date = t['effective_date']

			crosses_over_month = settlement_date.month > deposit_date.month
			days_into_month = settlement_date.day

			augmented_transactions.append(models.AugmentedTransactionDict(
				transaction=t,
				payment=payment_dict,
				tx_info=models.AugmentedTransactionInfo(
					crosses_over_month=crosses_over_month,
					days_into_month=days_into_month
				)
			))

		return augmented_transactions, None

def _get_company_vendor_partnership_vendor_bank_account_id(
	customer_id: str,
	vendor_id: str,
	vendor_name: str,
	session: Session,
) -> Tuple[str, errors.Error]:
	company_vendor_partnership = cast(
		models.CompanyVendorPartnership,
		session.query(models.CompanyVendorPartnership).filter_by(
			company_id=customer_id,
			vendor_id=vendor_id,
		).first())

	if not company_vendor_partnership:
		return None, errors.Error(f'[DATA ERROR] Company vendor partnership between customer {customer_id} and vendor {vendor_id} does not exist')

	if not company_vendor_partnership.vendor_bank_id:
		return None, errors.Error(f'Vendor {vendor_name} does not have ban account to receive advances configured')

	return company_vendor_partnership.vendor_bank_id, None

def get_loan_recipient_bank_account_id(
	loan: models.Loan,
	session: Session,
) -> Tuple[str, errors.Error]:
	customer_id = str(loan.company_id)

	customer = cast(
		models.Company,
		session.query(models.Company).get(customer_id))

	if not customer:
		return None, errors.Error(f'[DATA ERROR]: Could not find customer by id {customer_id}')

	if loan.loan_type == db_constants.LoanTypeEnum.INVENTORY:
		purchase_order = cast(
			models.PurchaseOrder,
			session.query(models.PurchaseOrder).get(loan.artifact_id))

		if not purchase_order:
			return None, errors.Error(f'[DATA ERROR] Loan {str(loan.id)} is missing associated purchase order')

		vendor = cast(
			models.Company,
			session.query(models.Company).get(purchase_order.vendor_id))

		if not vendor:
			return None, errors.Error(f'[DATA ERROR] Purchase order {str(purchase_order.id)} is missing associated vendor')

		vendor_id = str(vendor.id)
		vendor_bank_account_id, err = _get_company_vendor_partnership_vendor_bank_account_id(
			customer_id,
			vendor_id,
			vendor.name,
			session,
		)

		if err:
			return None, err

		return vendor_bank_account_id, None

	elif loan.loan_type == db_constants.LoanTypeEnum.LINE_OF_CREDIT:
		line_of_credit = cast(
			models.LineOfCredit,
			session.query(models.LineOfCredit).get(loan.artifact_id))

		if not line_of_credit:
			return None, errors.Error(f'[DATA ERROR] Loan {str(loan.id)} is missing associated line of credit')

		vendor = cast(
			models.Company,
			session.query(models.Company).get(line_of_credit.recipient_vendor_id))

		if vendor:
			vendor_id = str(vendor.id)
			vendor_bank_account_id, err = _get_company_vendor_partnership_vendor_bank_account_id(
				customer_id,
				vendor_id,
				vendor.name,
				session,
			)

			if err:
				return None, err

			return vendor_bank_account_id, None

	# If none of the above, then either of the following is true:
	# - Loan type is LINE OF CREDIT and there is no recipient vendor
	# - Loan type is INVOICE
	#
	# For either of these cases, advance is sent to the Customer's bank account.
	if not customer.company_settings_id:
		return None, errors.Error(f'[DATA ERROR] Company {customer_id} is missing company settings id')

	company_settings = cast(
		models.CompanySettings,
		session.query(models.CompanySettings).get(str(customer.company_settings_id)))

	if not company_settings:
		return None, errors.Error(f'[DATA ERROR] Company {customer_id} is missing associated company settings')

	if not company_settings.advances_bank_account_id:
		return None, errors.Error(f'Company {customer.name} does not have advances bank account to receive advances configured')

	return str(company_settings.advances_bank_account_id), None

def get_loan_sender_bank_account_id(
	loan: models.Loan,
	session: Session,
) -> Tuple[str, errors.Error]:
	customer_id = str(loan.company_id)

	customer = cast(
		models.Company,
		session.query(models.Company).get(customer_id))

	if not customer:
		return None, errors.Error(f'[DATA ERROR]: Could not find customer by id {customer_id}')

	if not customer.company_settings_id:
		return None, errors.Error(f'[DATA ERROR] Company {customer_id} is missing company settings id')

	company_settings = cast(
		models.CompanySettings,
		session.query(models.CompanySettings).get(str(customer.company_settings_id)))

	if not company_settings:
		return None, errors.Error(f'[DATA ERROR] Company {customer_id} is missing associated company settings')

	if not company_settings.advances_bespoke_bank_account_id:
		return None, errors.Error(f'Company {customer.name} does not have BF advances bank account to send advances FROM configured')

	return str(company_settings.advances_bespoke_bank_account_id), None

def compute_loan_approval_status(loan: models.Loan) -> str:
	if loan.rejected_at is not None:
		return db_constants.LoanStatusEnum.REJECTED
	elif loan.approved_at is not None:
		return db_constants.LoanStatusEnum.APPROVED
	elif loan.requested_at is not None:
		return db_constants.LoanStatusEnum.APPROVAL_REQUESTED
	else:
		return db_constants.LoanStatusEnum.DRAFTED

def compute_loan_payment_status(loan: models.Loan, session: Session) -> str:
	if loan.closed_at is not None:
		return db_constants.PaymentStatusEnum.CLOSED

	pending_repayments = cast(
		List[models.Payment],
		session.query(models.Payment).filter(
			models.Payment.company_id == loan.company_id
		).filter(
			models.Payment.type == db_constants.PaymentType.REPAYMENT
		).filter(
			cast(Callable, models.Payment.settled_at.is_)(None)
		).filter(
			cast(Callable, models.Payment.reversed_at.is_)(None)
		).filter(
			cast(Callable, models.Payment.is_deleted.isnot)(True)
		).all())

	for pending_repayment in pending_repayments:
		items_covered = cast(PaymentItemsCoveredDict, pending_repayment.items_covered)
		if items_covered is not None:
			selected_loan_ids = items_covered['loan_ids'] if 'loan_ids' in items_covered else []
			if str(loan.id) in selected_loan_ids:
				return db_constants.PaymentStatusEnum.PENDING

	repayment_transaction = cast(
		models.Transaction,
		session.query(models.Transaction).filter(
			models.Transaction.type == db_constants.PaymentType.REPAYMENT
		).filter(
			models.Transaction.loan_id == loan.id
		).filter(
			cast(Callable, models.Transaction.is_deleted.isnot)(True)
		).first())

	if repayment_transaction is not None:
		return db_constants.PaymentStatusEnum.PARTIALLY_PAID

	return None

def is_valid_uuid(uuid_to_test: str, version: int = 4) -> bool:
    try:
        uuid_obj = UUID(uuid_to_test, version = version)
    except ValueError:
        return False
    return str(uuid_obj) == uuid_to_test
