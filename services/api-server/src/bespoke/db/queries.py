import datetime
import logging
from typing import Callable, cast, List, Tuple

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import ClientSurveillanceCategoryEnum, LoanTypeEnum, PaymentType, RequestStatusEnum

from sqlalchemy import or_, and_
from sqlalchemy.orm.session import Session

# ###############################
# Companies
# ###############################

def get_all_customers(
    session: Session,
) -> Tuple[ List[models.Company], errors.Error ]:
    # fmt: off
    customers = cast(
        List[models.Company],
        session.query(models.Company).filter(
            models.Company.is_customer == True
        ).order_by(
            models.Company.name.asc()
        ).all())
    # fmt: on

    if not customers:
        return None, errors.Error("No customers have been found in the system")

    return customers, None

def get_company_by_id(
    session: Session,
    company_id: str,
) -> Tuple[ models.Company, errors.Error ]:
    # fmt: off
    company = cast(
        models.Company,
        session.query(models.Company).filter(
            models.Company.id == company_id
        ).first())
    # fmt: on

    if not company:
        return None, errors.Error("No company with the specified id exists in the system")

    return company, None

# ###############################
# Company Settings
# ###############################

def get_company_settings_by_id(
    session: Session,
    company_settings_id: str,
) -> Tuple[ models.CompanySettings, errors.Error ]:
    # fmt: off
    filters = [
        models.CompanySettings.id == company_settings_id
    ]

    company_settings = cast(
        models.CompanySettings,
        session.query(models.CompanySettings).filter(
            *filters
        ).first())
    # fmt: on

    if not company_settings:
        return None, errors.Error("No company settings with the specified id exists in the system")

    return company_settings, None

# ###############################
# Company Vendor Partnerships
# ###############################

def get_company_vendor_partnerships(
    session: Session,
    company_vendor_id_pairs: List[ Tuple[str, str] ],
) -> Tuple[ List[models.CompanyVendorPartnership], errors.Error ]:
    # fmt: off
    filters = [
        or_(
            *[
                and_(
                    models.CompanyVendorPartnership.company_id == pair[0],
                    models.CompanyVendorPartnership.vendor_id == pair[1],
                ) for pair in company_vendor_id_pairs
            ]
        )
    ]

    company_vendor_partnerships = cast(
        List[models.CompanyVendorPartnership],
        session.query(models.CompanyVendorPartnership).filter(
            *filters
        ).all())
    # fmt: on

    return company_vendor_partnerships, None


# ###############################
# Company Settings
# ###############################

def get_company_settings_for_target_companies(
    session: Session,
    company_ids: List[str],
    allow_dummy: bool = False,
) -> Tuple[ List[models.CompanySettings], errors.Error ]:
    filters = [
        models.CompanySettings.company_id.in_(company_ids)
    ]

    if not allow_dummy:
        filters.append(cast(Callable, models.CompanySettings.is_dummy_account.isnot)(True))

    # fmt: off
    company_settings = cast(
        List[models.CompanySettings],
        session.query(models.CompanySettings).filter(
            *filters   
        ).all())
    # fmt: on

    if not company_settings:
        return None, errors.Error("No company settings found for the provided companies")

    return company_settings, None

def get_company_settings_for_target_company(
    session: Session,
    company_id: str,
    allow_dummy: bool = False,
) -> Tuple[ models.CompanySettings, errors.Error ]:
    filters = [
        models.CompanySettings.company_id == company_id
    ]

    if not allow_dummy:
        filters.append(cast(Callable, models.CompanySettings.is_dummy_account.isnot)(True))

    # fmt: off
    company_settings = cast(
        models.CompanySettings,
        session.query(models.CompanySettings).filter(
            *filters   
        ).first())
    # fmt: on

    if not company_settings:
        return None, errors.Error("No company settings found for the provided company")

    return company_settings, None

# ###############################
# Ebba Applications
# ###############################

def get_approved_financial_reports_by_company_id(
    session: Session,
    company_id: str,
) -> Tuple[ List[models.EbbaApplication], errors.Error ]:
    filters = [
        models.EbbaApplication.company_id == company_id,
        models.EbbaApplication.category == ClientSurveillanceCategoryEnum.FINANCIAL_REPORT,
        models.EbbaApplication.status == RequestStatusEnum.APPROVED,
    ]

    # fmt: off
    financial_reports = cast(
        List[models.EbbaApplication],
        session.query(models.EbbaApplication).filter(
            *filters
        ).order_by(
            models.EbbaApplication.application_date.desc()
        ).all())
    # fmt: on

    # no need to check for if financial_reports is none
    # as that is not an error state

    return financial_reports, None

# ###############################
# Financial Summaries
# ###############################

def get_financial_summaries_for_target_customers(
    session: Session,
    company_ids: List[str],
    date: datetime.date = None,
) -> Tuple[ List[models.FinancialSummary], errors.Error ]:
    filters = [
        models.FinancialSummary.company_id.in_(company_ids)
    ]

    if date is not None:
        filters.append(models.FinancialSummary.date == date)

    # fmt: off
    financial_summaries = cast(
        List[models.FinancialSummary],
        session.query(models.FinancialSummary).filter(
            *filters   
        ).all())
    # fmt: on

    if not financial_summaries:
        return None, errors.Error(
            f"""No financial summaries have been found for the provided companies on {
                date_util.human_readable_yearmonthday_from_date(date) if date is not None else "any date"
            }""")

    return financial_summaries, None

def get_financial_summaries_for_target_customer(
    session: Session,
    company_id: str,
    date: datetime.date = None,
) -> Tuple[ List[models.FinancialSummary], errors.Error ]:
    filters = [
        models.FinancialSummary.company_id == company_id
    ]

    if date is not None:
        filters.append(models.FinancialSummary.date == date)

    # fmt: off
    financial_summaries = cast(
        List[models.FinancialSummary],
        session.query(models.FinancialSummary).filter(
            *filters   
        ).all())
    # fmt: on

    if not financial_summaries:
        return None, errors.Error(
            f"""No financial summaries have been found for the provided companiy on {
                date_util.human_readable_yearmonthday_from_date(date) if date is not None else "any date"
            }""")

    return financial_summaries, None

# ###############################
# Loans
# ###############################

def get_loan(
    session: Session,
    loan_id: str = None,
    artifact_id: str = None,
    amount: float = None,
    is_funded: bool = False,
    loan_type: str = LoanTypeEnum.INVENTORY,
) -> Tuple[ models.Loan, errors.Error ]:
    filters = [
        cast(Callable, models.Loan.is_deleted.isnot)(True),
        models.Loan.loan_type == loan_type,
    ]

    if loan_id is not None:
        filters.append(models.Loan.id == loan_id)

    if artifact_id is not None:
        filters.append(models.Loan.artifact_id == artifact_id)

    if amount is not None:
        filters.append(models.Loan.amount == amount)

    if not is_funded:
        filters.append(models.Loan.funded_at == None)

    # fmt: off
    loan = cast(
        models.Loan,
        session.query(models.Loan).filter(
            *filters
        ).first())
    # fmt: on

    if not loan:
        return None, errors.Error("No loan with the specified id exists in the system")

    return loan, None

def get_open_mature_loans_for_target_customers(
    session: Session,
    company_ids: List[str],
    end_date: datetime.date,
    start_date: datetime.date = None,
) -> Tuple[ List[models.Loan], errors.Error ]:
    """
        IMPORTANT: Both start_date and end_date are inclusive
    """
    filters = [
        cast(Callable, models.Loan.is_deleted.isnot)(True),
        models.Loan.company_id.in_(company_ids),
        models.Loan.closed_at == None,
        models.Loan.rejected_at == None,
    ]

    if start_date is not None:
        filters.append(
            and_(
                models.Loan.adjusted_maturity_date <= end_date,
                models.Loan.adjusted_maturity_date >= start_date,
            )
        )
    else:
        filters.append(models.Loan.adjusted_maturity_date <= end_date)

    # fmt: off
    loans = cast(
        List[models.Loan],
        session.query(models.Loan).filter(
            *filters    
        ).order_by(
            models.Loan.created_at.desc()
        ).all())
    # fmt: on

    # Since not finding loans isn't inherently a sign
    # of anything wrong, we do not do an error check
    # for if not loans. We keep the return signature
    # to keep a consistent signature, though.

    return loans, None

# ###############################
# Parent Company
# ###############################

def get_parent_company_by_id(
    session: Session,
    parent_company_id: str,
) -> Tuple[ models.ParentCompany, errors.Error ]:
    # fmt: off
    parent_company = cast(
        models.ParentCompany,
        session.query(models.ParentCompany).filter(
            models.ParentCompany.id == parent_company_id
        ).first())
    # fmt: on

    if not parent_company:
        return None, errors.Error("No parent company with the specified id exists in the system")

    return parent_company, None

# ###############################
# Payments
# ###############################

def get_payments(
    session: Session,
    payment_ids: List[str],
    is_unsettled: bool = False,
) -> Tuple[ List[models.Payment], errors.Error ]:
    filters = [
        cast(Callable, models.Payment.is_deleted.isnot)(True),
        models.Payment.id.in_(payment_ids)
    ]

    if is_unsettled:
        filters.append(models.Payment.settled_at == None)

    # fmt: off
    payments = cast(
        List[models.Payment],
        session.query(models.Payment).filter(
            *filters
        ).all())
    # fmt: on

    # Since not finding payments isn't inherently a sign
    # of anything wrong, we do not do an error check
    # for if not payments. We keep the return signature
    # to keep a consistent signature, though.

    return payments, None

def get_open_repayments_by_company_ids(
    session: Session,
    company_ids: List[str],
) -> Tuple[ List[models.Payment], errors.Error ]:
    filters = [
        cast(Callable, models.Payment.is_deleted.isnot)(True),
        models.Payment.company_id.in_(company_ids),
        models.Payment.settled_at == None,
        models.Payment.type == PaymentType.REPAYMENT,
    ]

    # fmt: off
    payments = cast(
        List[models.Payment],
        session.query(models.Payment).filter(
            *filters
        ).all())
    # fmt: on

    # no need to check for payments is none
    # that is not inherently an error state

    return payments, None

# ###############################
# Purchase Orders
# ###############################

def get_purchase_order_by_id(
    session: Session,
    purchase_order_id: str,
) -> Tuple[ models.PurchaseOrder, errors.Error]:
    filters = [
        models.PurchaseOrder.id == purchase_order_id,
    ]

    # fmt: off
    purchase_order = cast(
        models.PurchaseOrder,
        session.query(models.PurchaseOrder).filter(
            *filters
        ).first())

    if not purchase_order:
        return None, errors.Error("Could not find a purchase order in our system with the given id")

    return purchase_order, None

def get_purchase_orders(
    session: Session,
    purchase_order_ids: List[str],
) -> Tuple[ List[models.PurchaseOrder], errors.Error ]:
    filters = [
        models.PurchaseOrder.id.in_(purchase_order_ids)
    ]

    # fmt: off
    purchase_orders = cast(
        List[models.PurchaseOrder],
        session.query(models.PurchaseOrder).filter(
            *filters
        ).all())
    # fmt: on

    # Since not finding purchase orders isn't inherently a sign
    # of anything wrong, we do not do an error check
    # for if not purchase_orders. We keep the return signature
    # to keep a consistent signature, though.

    return purchase_orders, None

# ###############################
# Transactions
# ###############################

def get_transactions(
    session: Session,
    loan_ids: List[str] = None,
    is_repayment: bool = False,
) -> Tuple[ List[models.Transaction], errors.Error ]:
    filters = []

    if loan_ids is not None:
        filters.append(models.Transaction.loan_id.in_(loan_ids))

    if is_repayment:
        filters.append(models.Transaction.type == PaymentType.REPAYMENT)

    # fmt: off
    transactions = cast(
        List[models.Transaction],
        session.query(models.Transaction).filter(
            *filters
        ).all())
    # fmt: on

    # Since not finding transactions isn't inherently a sign
    # of anything wrong, we do not do an error check
    # for if not transactions. We keep the return signature
    # to keep a consistent signature, though.

    return transactions, None

# ###############################
# Users
# ###############################

def get_user_by_id(
    session: Session,
    user_id: str,
) -> Tuple[ models.User, errors.Error ]:
    filters = [
        models.User.id == user_id
    ]

    user = cast(
        models.User,
        session.query(models.User).filter(
            *filters
        ).first())

    if not user:
        return None, errors.Error('Could not find client success user with the provided id of {user_id}')

    return user, None

# ###############################
# Monthly Summary Calculations
# ###############################
def get_monthly_summary_calculation_by_company_id_and_date(
    session: Session,
    company_id: str,
    report_month_last_day: datetime.date,
) -> Tuple[ models.MonthlySummaryCalculation, errors.Error]:
    filters = [
        models.MonthlySummaryCalculation.company_id == company_id,
        models.MonthlySummaryCalculation.report_month == report_month_last_day,
    ]

    # fmt: off
    msc = cast(
        models.MonthlySummaryCalculation,
        session.query(models.MonthlySummaryCalculation).filter(
            *filters
        ).first())
    # fmt: on

    if not msc:
        return msc, errors.Error("No monthly summary calculation with specified company id and date")

    return msc, None
