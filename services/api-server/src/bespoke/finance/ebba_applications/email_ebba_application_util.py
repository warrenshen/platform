from decimal import Decimal
from typing import cast, Dict, List, Tuple
from sqlalchemy.orm.session import Session
import datetime

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import (AutomatedSurveillanceMessage, ClientSurveillanceCategoryEnum, 
	CompanySurveillanceStatus, RequestStatusEnum, ProductType)
from bespoke.email import sendgrid_util
from flask import current_app
from server.config import Config
from bespoke.finance import financial_summary_util


def alert_expired_borrowing_base(
	session : Session, 
	today_date : datetime.date
) -> Tuple[List[models.Company], errors.Error]:
	
	current_page = 0
	BATCH_SIZE = 50
	is_done = False
	expired_borrowing_base_companies = []

	while not is_done:
		companies = cast(
			List[models.Company],
			session.query(models.Company).filter(
				models.Company.is_customer == True,
			).offset(
				current_page * BATCH_SIZE
			).limit(BATCH_SIZE).all())

		if len(companies) <= 0:
			is_done = True
			continue

		company_id_lookup : Dict[str, models.Company] = {}
		
		valid_company_ids = []
		active_company_ids = []

		for company in companies:
			company_id_lookup[str(company.id)] = company

			financial_summary = financial_summary_util.get_latest_financial_summary(session, company.id)
			
			has_valid_product_type = financial_summary.product_type != ProductType.LINE_OF_CREDIT
			if has_valid_product_type:
				valid_company_ids.append(str(company.id))
		
		company_settings = cast(
			List[models.CompanySettings],
			session.query(models.CompanySettings).filter(
				models.CompanySettings.company_id.in_(valid_company_ids)
			# for testing purposes
			).filter(
				models.CompanySettings.is_dummy_account == True
			# ).filter(
			# 	models.CompanySettings.is_dummy_account == False
			).all())

		for company_setting in company_settings:
			if company_setting.active_borrowing_base_id is None:
				expired_borrowing_base_companies.append(company_id_lookup[str(company_setting.company_id)])
			else:
				active_company_ids.append(str(company_setting.company_id))

		ebba_applications = cast(
			List[models.EbbaApplication],
			session.query(models.EbbaApplication).filter(
				models.EbbaApplication.company_id.in_(active_company_ids)
			).filter(
				models.EbbaApplication.expires_date < today_date
			).filter(
				models.EbbaApplication.status != RequestStatusEnum.APPROVAL_REQUESTED
			).order_by(
	    		models.EbbaApplication.expires_date.desc()
			).all())

		for ebba_application in ebba_applications:
			expired_borrowing_base_companies.append(company_id_lookup[str(ebba_application.company_id)])
		
		current_page += 1

	return expired_borrowing_base_companies, None
