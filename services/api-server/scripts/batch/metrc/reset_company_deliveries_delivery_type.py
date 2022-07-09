'''
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/batch/

What:
This script resets the delivery_type column of relevant company deliveries.
It additionally sets the payor_id and vendor_id columns if appropriate.

Why:
You can run this script to fix incorrect values in the delivery_type column of company deliveries in the database.
'''

import argparse
import os
import sys
import time
from os import path
from typing import Any, List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), '../../../src')))
sys.path.append(path.realpath(path.join(path.dirname(__file__), '../../')))

from bespoke.db import db_constants, metrc_models_util, models, models_util

def main(is_test_run: bool, company_identifier: str) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	company_id = None

	with models.session_scope(session_maker) as session:
		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.identifier == company_identifier
			).first())

		if not company:
			print('ERROR! No company exists for given company identifier')
			return
		else:
			company_id = str(company.id)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			offset = current_page * BATCH_SIZE
			print(f'[Page {current_page + 1} offset {offset}] Resetting company_deliveries delivery_type...')

			try:
				company_deliveries_batch = cast(
					List[models.CompanyDelivery],
					session.query(models.CompanyDelivery).filter(
						models.CompanyDelivery.company_id == company_id
					).order_by(
						models.CompanyDelivery.delivery_type
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())
			except Exception as e:
				print(e)
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			if len(company_deliveries_batch) <= 0:
				is_done = True
				continue
			else:
				for company_delivery in company_deliveries_batch:
					if company_delivery.delivery_type != db_constants.DeliveryType.UNKNOWN:
						continue

					metrc_transfer = cast(
						models.MetrcTransfer,
						session.query(models.MetrcTransfer).filter(
							models.MetrcTransfer.id == company_delivery.transfer_row_id
						).first())

					metrc_delivery = cast(
						models.MetrcDelivery,
						session.query(models.MetrcDelivery).filter(
							models.MetrcDelivery.id == company_delivery.delivery_row_id
						).first())

					if not metrc_transfer or not metrc_delivery:
						print('Skipping company_delivery {str(company_delivery.id)} since it does not have metrc transfer or metrc delivery...')
						continue

					shipper_company_id = None

					if not company_delivery.vendor_id:
						shipper_license_number = metrc_transfer.shipper_facility_license_number
						shipper_license = models_util.get_licenses_base_query(session).filter(
							models.CompanyLicense.license_number == shipper_license_number
						).first()
						if shipper_license:
							shipper_company_id = shipper_license.company_id
							if shipper_company_id:
								print(f'Updating company_delivery {str(company_delivery.id)} vendor_id from {str(company_delivery.vendor_id)} to {str(shipper_company_id)}...')
								if not is_test_run:
									company_delivery.vendor_id = cast(Any, shipper_company_id)
					else:
						shipper_company_id = company_delivery.vendor_id

					recipient_company_id = None

					if not company_delivery.payor_id:
						recipient_license_number = metrc_delivery.recipient_facility_license_number
						recipient_license = models_util.get_licenses_base_query(session).filter(
							models.CompanyLicense.license_number == recipient_license_number
						).first()
						if recipient_license:
							recipient_company_id = recipient_license.company_id
							if recipient_company_id:
								print(f'Updating company_delivery {str(company_delivery.id)} payor_id from {str(company_delivery.payor_id)} to {str(recipient_company_id)}...')
								if not is_test_run:
									company_delivery.payor_id = cast(Any, recipient_company_id)
					else:
						recipient_company_id = company_delivery.payor_id

					delivery_type = metrc_models_util.get_delivery_type(
						transfer_type=company_delivery.transfer_type,
						company_id=str(company_id),
						shipper_company_id=str(shipper_company_id) if shipper_company_id else None,
						recipient_company_id=str(recipient_company_id) if recipient_company_id else None
					)

					if company_delivery.delivery_type != delivery_type:
						print(f'Updating company_delivery {str(company_delivery.id)} delivery_type from {company_delivery.delivery_type} to {delivery_type}...')
						if not is_test_run:
							company_delivery.delivery_type = delivery_type

				current_page += 1

parser = argparse.ArgumentParser()
parser.add_argument('company_identifier', help='Identifier of company to perform action on')

if __name__ == '__main__':
	args = parser.parse_args()

	if not os.environ.get('DATABASE_URL'):
		print('You must set "DATABASE_URL" in the environment to use this script')
		exit(1)

	is_test_run = True

	if not os.environ.get('CONFIRM'):
		print('This script CHANGES information in the database')
		print('You must set "CONFIRM=1" as an environment variable to actually perform database changes with this script')
	else:
		is_test_run = False

	main(is_test_run=is_test_run, company_identifier=args.company_identifier)
