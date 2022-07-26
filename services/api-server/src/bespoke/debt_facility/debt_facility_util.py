import datetime
import logging
from typing import Callable, Dict, List, Tuple, cast

from sqlalchemy import and_
from sqlalchemy.orm.session import Session

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import (
    CompanyDebtFacilityStatus,
    DebtFacilityEventCategory,
    LoanDebtFacilityStatus,
    ProductType,
)
from bespoke.metrc.common.metrc_common_util import chunker

def _check_if_status_change_moves_loans_to_update_required(
    old_debt_facility_status: str,
    new_debt_facility_status: str,
) -> bool:
    
    waiver_to_bad_status_check = old_debt_facility_status == CompanyDebtFacilityStatus.WAIVER and \
     (
         new_debt_facility_status == CompanyDebtFacilityStatus.INELIGIBLE_FOR_FACILITY or \
      new_debt_facility_status == CompanyDebtFacilityStatus.OUT_OF_COMPLIANCE or \
      new_debt_facility_status == CompanyDebtFacilityStatus.DEFAULTING
     )
    
    good_to_bad_status_check = (
        old_debt_facility_status == CompanyDebtFacilityStatus.GOOD_STANDING or \
       old_debt_facility_status == CompanyDebtFacilityStatus.ON_PROBATION or \
       old_debt_facility_status == CompanyDebtFacilityStatus.INELIGIBLE_FOR_FACILITY
    ) and \
      (
          new_debt_facility_status == CompanyDebtFacilityStatus.OUT_OF_COMPLIANCE or \
       new_debt_facility_status == CompanyDebtFacilityStatus.DEFAULTING
      )
    
    bad_to_bad_status_check = (
        old_debt_facility_status == CompanyDebtFacilityStatus.OUT_OF_COMPLIANCE or \
       old_debt_facility_status == CompanyDebtFacilityStatus.DEFAULTING or \
       old_debt_facility_status == CompanyDebtFacilityStatus.INELIGIBLE_FOR_FACILITY
    ) and \
      (
          new_debt_facility_status == CompanyDebtFacilityStatus.OUT_OF_COMPLIANCE or \
       new_debt_facility_status == CompanyDebtFacilityStatus.DEFAULTING
      ) and \
      old_debt_facility_status != new_debt_facility_status
    
    return waiver_to_bad_status_check or good_to_bad_status_check or bad_to_bad_status_check

def update_company_debt_facility_status(
    session: Session,
    user: models.User,
    company_id: str,
    new_debt_facility_status: str,
    status_change_comment: str,
    waiver_date: str,
    waiver_expiration_date: str,
) -> Tuple[ int, errors.Error ]:
    # This number is used for unit testing
    loans_updated_count = 0
    
    company = cast(
        models.Company,
        session.query( models.Company ).filter( models.Company.id == company_id ).first(),
    )
    
    contract = cast(
        models.Contract,
        session.query( models.Contract ).filter(
            models.Contract.company_id == company_id,
        ).order_by(
            models.Contract.start_date.desc(),
        ).first(),
    )
    
    # Grab old debt facility status to record in debt facility event before setting new status
    old_debt_facility_status = company.debt_facility_status
    company.debt_facility_status = new_debt_facility_status
    
    payload: Dict[ str, object ] = {
        "user_name": user.first_name + " " + user.last_name,
        "user_id": str( user.id ),
        "old_status": old_debt_facility_status,
        "new_status": new_debt_facility_status,
    }
    if new_debt_facility_status == CompanyDebtFacilityStatus.WAIVER:
        payload[ "waiver_date" ] = waiver_date
        payload[ "waiver_expiration_date" ] = waiver_expiration_date
    
    
    session.add(
        models.DebtFacilityEvent( # type: ignore
         company_id = str(company.id),
         event_category = DebtFacilityEventCategory.COMPANY_STATUS_CHANGE,
         event_date = date_util.now(),
         event_comments = status_change_comment,
         event_payload = payload,
        ),
    )
    
    loans = cast(
        List[ models.Loan ],
        session.query( models.Loan ).filter(
            models.Loan.company_id == company.id,
        ).filter( models.Loan.closed_at == None ).filter(
            cast(
                Callable,
                models.Loan.is_deleted.isnot,
            )( True ),
        ).all(),
    )
    
    loan_report_ids = []
    for loan in loans:
        loan_report_ids.append( loan.loan_report_id )
    
    loan_reports = cast(
        List[ models.LoanReport ],
        session.query( models.LoanReport ).filter(
            models.LoanReport.id.in_( loan_report_ids ),
        ).all(),
    )
    
    debt_facility = cast(
        models.DebtFacility,
        session.query( models.DebtFacility ).filter(
            models.DebtFacility.name == "CoVenture",
        ).first(),
    )
    
    debt_facility_id = debt_facility.id if debt_facility is not None else ""
    
    if (
        old_debt_facility_status == CompanyDebtFacilityStatus.WAIVER or \
     old_debt_facility_status == CompanyDebtFacilityStatus.OUT_OF_COMPLIANCE or \
     old_debt_facility_status == CompanyDebtFacilityStatus.DEFAULTING
    ) and \
     (
         new_debt_facility_status == CompanyDebtFacilityStatus.GOOD_STANDING or \
      new_debt_facility_status == CompanyDebtFacilityStatus.ON_PROBATION
     ):
        
        company.debt_facility_waiver_date = None
        company.debt_facility_waiver_expiration_date = None
        
        for loan_report in loan_reports:
            if (
                loan_report.debt_facility_status == CompanyDebtFacilityStatus.WAIVER or \
             loan_report.debt_facility_status == LoanDebtFacilityStatus.WAIVER or \
             loan_report.debt_facility_status == LoanDebtFacilityStatus.UPDATE_REQUIRED
            ):
                
                loan_report.debt_facility_id = debt_facility_id
                loan_report.debt_facility_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY
                loan_report.debt_facility_waiver_date = None
                loan_report.debt_facility_waiver_expiration_date = None
                
                loans_updated_count += 1
    
    elif _check_if_status_change_moves_loans_to_update_required(
        old_debt_facility_status,
        new_debt_facility_status,
    ):
        company.debt_facility_waiver_date = None
        company.debt_facility_waiver_expiration_date = None
        
        for loan_report in loan_reports:
            if (
                loan_report.debt_facility_status == LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY or \
             loan_report.debt_facility_status == LoanDebtFacilityStatus.WAIVER or \
             loan_report.debt_facility_status == CompanyDebtFacilityStatus.WAIVER
            ):
                
                loan_report.debt_facility_id = None
                loan_report.debt_facility_status = LoanDebtFacilityStatus.UPDATE_REQUIRED
                loan_report.debt_facility_waiver_date = None
                loan_report.debt_facility_waiver_expiration_date = None
                
                loans_updated_count += 1
    
    elif new_debt_facility_status == CompanyDebtFacilityStatus.WAIVER:
        company.debt_facility_waiver_date = date_util.load_date_str( waiver_date )
        company.debt_facility_waiver_expiration_date = date_util.load_date_str(
            waiver_expiration_date,
        )
        
        for loan_report in loan_reports:
            if (
                loan_report.debt_facility_status != LoanDebtFacilityStatus.BESPOKE_BALANCE_SHEET and \
             loan_report.debt_facility_status != LoanDebtFacilityStatus.REPURCHASED
            ):
                
                loan_report.debt_facility_id = debt_facility_id
                loan_report.debt_facility_status = CompanyDebtFacilityStatus.WAIVER
                loan_report.debt_facility_waiver_date = date_util.load_date_str( waiver_date )
                loan_report.debt_facility_waiver_expiration_date = date_util.load_date_str(
                    waiver_expiration_date,
                )
                
                loans_updated_count += 1
    
    return loans_updated_count, None

def check_past_due_loans(
    session: Session,
    today_date: datetime.date,
    LOAN_BATCH_SIZE: int = 20,
) -> Tuple[ int, int ]:
    """
	Steps in this check:
	1. Look up all paginated non-vendor/non-payor companies
	2. If company has a - not - expired company waiver:
		- continue to next company
	3. Grab the open and approved loans based for the company
	4. Iterate through loans to get loan_report_ids
		- For this chunk
		- Save all loan report ids in case we find an unwaived loan over 30 days past due
	5. Iterate over loans from loans chunk
		a. If company has an expired waiver and the loan has no waiver or an expired waiver
			- all loans with no current waivers for that company currently in a debt facility move to update_required
		b. If there is no company waiver and the loan waiver -is not- expired
			- do nothing
		c. If there is no company waiver and the loan waiver -is- expired
			- all loans for that company currently in a debt facility move to update_required
		d. If there are no company waivers or loan waivers
			- all loans for that company currently in a debt facility move to update_required
	6. If unwaived loan over 30 days past due found during the chunked processing:
		a. Change loan_report's debt facility status to update_required if previously in debt facility, 
			if any loan is past due and unwaived
		b. Change company's debt facility status to ineligible for facility
	"""
    
    # These variables exist to help with unit testing
    loans_updated_count = 0
    companies_updated_count = 0
    
    is_done = False
    page_index = 0
    batch_size = 5
    
    while not is_done:
        # Step 1 - Look up all paginated non-vendor/non-payor companies
        companies = cast(
            List[ models.Company ],
            session.query( models.Company ).filter(
                models.Company.is_customer == True,
            ).offset( page_index * batch_size ).limit( batch_size ).all(),
        )
        
        if not companies:
            is_done = True
            break
        
        for company in companies:
            has_company_waiver = (
                company.debt_facility_status == CompanyDebtFacilityStatus.WAIVER
            )
            company_waiver_expiration_date = company.debt_facility_waiver_expiration_date
            company_has_unwaived_past_due_loans = False
            
            # Step 2 - company waiver is not expired, skip this company
            if has_company_waiver and company_waiver_expiration_date > today_date:
                continue
            
            # Step 3 - Grab the open and approved loans based for the company
            loans = cast(
                List[ models.Loan ],
                session.query( models.Loan ).filter( models.Loan.company_id == company.id ).filter(
                    cast( Callable, models.Loan.is_deleted.isnot )( True ),
                ).filter(
                    and_(
                        models.Loan.closed_at == None,
                        models.Loan.origination_date != None,
                    ),
                ).filter( models.Loan.loan_report_id != None ).all(),
            )
            
            # used if the check finds an unwaived past due loan in any chunk to work through later
            all_loan_report_ids = []
            
            batch_index = 1
            batches_count = len( loans ) // LOAN_BATCH_SIZE + 1
            for loans_chunk in chunker( loans, LOAN_BATCH_SIZE ):
                logging.info(
                    f'Checking loans for past due batch {batch_index} of {batches_count} on company {company.name}...',
                )
                
                # Step 4
                loan_report_ids = []
                loan_lookup: Dict[ str, models.Loan ] = {}
                for loan in loans_chunk:
                    loan_report_ids.append( str( loan.loan_report_id ) )
                    loan_lookup[ str( loan.loan_report_id ) ] = loan
                    
                    all_loan_report_ids.append( str( loan.loan_report_id ) )
                
                loan_reports = cast(
                    List[ models.LoanReport ],
                    session.query(
                        models.LoanReport,
                    ).filter( models.LoanReport.id.in_( loan_report_ids ) ).all(),
                )
                
                # Step 5
                for loan_report in loan_reports:
                    loan = loan_lookup[ str( loan_report.id ) ]
                    has_loan_waiver = (
                        loan_report.debt_facility_status == LoanDebtFacilityStatus.WAIVER
                    )
                    loan_waiver_expiration_date = loan_report.debt_facility_waiver_expiration_date
                    
                    if loan.adjusted_maturity_date < today_date and \
                     date_util.num_calendar_days_passed(loan.adjusted_maturity_date, today_date) > 30:
                        # Step 5a - company has expired waiver and loan has no waiver or an expired waiver
                        if has_company_waiver and company_waiver_expiration_date < today_date and \
                         (not has_loan_waiver or loan_waiver_expiration_date < today_date):
                            company_has_unwaived_past_due_loans = True
                        # Step 5b - loan waiver -is not- expired
                        elif has_loan_waiver and loan_waiver_expiration_date > today_date:
                            pass
                        # Step 5c - no company waiver, expired loan waiver
                        elif has_loan_waiver and loan_report.debt_facility_waiver_date < today_date:
                            company_has_unwaived_past_due_loans = True
                        # Step 5d - no company or loan waivers
                        elif not has_company_waiver and not has_loan_waiver:
                            company_has_unwaived_past_due_loans = True
                
                batch_index += 1
            
            # Step 6
            if company_has_unwaived_past_due_loans:
                # Step 6a - Change loan_report's debt facility status to update_required if previously in debt facility
                for loan_report_ids_chunk in chunker( all_loan_report_ids, LOAN_BATCH_SIZE ):
                    loan_reports = cast(
                        List[ models.LoanReport ],
                        session.query(
                            models.LoanReport,
                        ).filter(
                            models.LoanReport.id.in_( loan_report_ids_chunk ),
                        ).all(),
                    )
                    
                    for loan_report in loan_reports:
                        if (
                            loan_report.debt_facility_status == LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY or \
                         loan_report.debt_facility_status == LoanDebtFacilityStatus.WAIVER or \
                         loan_report.debt_facility_status == CompanyDebtFacilityStatus.WAIVER
                        ):
                            
                            loan_report.debt_facility_waiver_expiration_date = None
                            loan_report.debt_facility_waiver_date = None
                            loan_report.debt_facility_status = LoanDebtFacilityStatus.UPDATE_REQUIRED
                            
                            loans_updated_count += 1
                            
                            session.add(
                                models.DebtFacilityEvent( # type: ignore
                                 loan_report_id = loan_report.id,
                                 event_category = DebtFacilityEventCategory.PAST_DUE_UPDATE_REQUIRED,
                                 event_date = date_util.now(),
                                 event_comments = "Automatic check if loan was 30+ days past due, moving loan to update required",
                                ),
                            )
                
                # Step 6b - Change company's debt facility status to ineligible for facility
                if not has_company_waiver or \
                 (has_company_waiver and company_waiver_expiration_date < today_date):
                    company.debt_facility_status = CompanyDebtFacilityStatus.INELIGIBLE_FOR_FACILITY
                    company.debt_facility_waiver_date = None
                    company.debt_facility_waiver_expiration_date = None
                    
                    companies_updated_count += 1
                    
                    session.add(
                        models.DebtFacilityEvent( # type: ignore
                         company_id = company.id,
                         event_category = DebtFacilityEventCategory.PAST_DUE_UPDATE_REQUIRED,
                         event_date = date_util.now(),
                         event_comments = "Automatic check if company waiver is expired, moving company to ineligible status",
                        ),
                    )
        
        page_index += 1
    
    return loans_updated_count, companies_updated_count
