"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/

What:
This script removes PII information from metrc_sales_receipts. This script should be run multiple times
until it does not make any updates to the database.

Why:
There was a bug in our code where we mistakenly stored PII information in the metrc_sales_receipts table.
"""

import os
import sys
from os import path
from sqlalchemy.orm.attributes import flag_modified

from typing import List, cast

sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))


from bespoke.db import models
from bespoke.metrc.sales_util import METRC_SALES_RECEIPT_SPECIAL_PII_KEYS

"""
List pulled by the following query in BigQuery:
select
    sales_receipts.us_state,
    sales_receipts.license_number,
    count(*)
from
    dbt_transformation.stg__metrc_sales_receipts as sales_receipts
group by
    sales_receipts.us_state,
    sales_receipts.license_number
order by
    sales_receipts.us_state,
    sales_receipts.license_number
"""
METRC_SALES_RECEIPT_TUPLES = [
	('CA', None),
	('CA', 'C10-0000002-LIC'),
	('CA', 'C10-0000005-LIC'),
	('CA', 'C10-0000025-LIC'),
	('CA', 'C10-0000034-LIC'),
	('CA', 'C10-0000037-LIC'),
	('CA', 'C10-0000041-LIC'),
	('CA', 'C10-0000045-LIC'),
	('CA', 'C10-0000064-LIC'),
	('CA', 'C10-0000088-LIC'),
	('CA', 'C10-0000101-LIC'),
	('CA', 'C10-0000117-LIC'),
	('CA', 'C10-0000155-LIC'),
	('CA', 'C10-0000169-LIC'),
	('CA', 'C10-0000199-LIC'),
	('CA', 'C10-0000204-LIC'),
	('CA', 'C10-0000207-LIC'),
	('CA', 'C10-0000224-LIC'),
	('CA', 'C10-0000227-LIC'),
	('CA', 'C10-0000230-LIC'),
	('CA', 'C10-0000241-LIC'),
	('CA', 'C10-0000246-LIC'),
	('CA', 'C10-0000254-LIC'),
	('CA', 'C10-0000258-LIC'),
	('CA', 'C10-0000271-LIC'),
	('CA', 'C10-0000279-LIC'),
	('CA', 'C10-0000280-LIC'),
	('CA', 'C10-0000286-LIC'),
	('CA', 'C10-0000301-LIC'),
	('CA', 'C10-0000316-LIC'),
	('CA', 'C10-0000324-LIC'),
	('CA', 'C10-0000332-LIC'),
	('CA', 'C10-0000339-LIC'),
	('CA', 'C10-0000341-LIC'),
	('CA', 'C10-0000364-LIC'),
	('CA', 'C10-0000372-LIC'),
	('CA', 'C10-0000376-LIC'),
	('CA', 'C10-0000396-LIC'),
	('CA', 'C10-0000403-LIC'),
	('CA', 'C10-0000408-LIC'),
	('CA', 'C10-0000411-LIC'),
	('CA', 'C10-0000414-LIC'),
	('CA', 'C10-0000425-LIC'),
	('CA', 'C10-0000454-LIC'),
	('CA', 'C10-0000461-LIC'),
	('CA', 'C10-0000464-LIC'),
	('CA', 'C10-0000474-LIC'),
	('CA', 'C10-0000525-LIC'),
	('CA', 'C10-0000528-LIC'),
	('CA', 'C10-0000547-LIC'),
	('CA', 'C10-0000548-LIC'),
	('CA', 'C10-0000590-LIC'),
	('CA', 'C10-0000596-LIC'),
	('CA', 'C10-0000603-LIC'),
	('CA', 'C10-0000606-LIC'),
	('CA', 'C10-0000618-LIC'),
	('CA', 'C10-0000624-LIC'),
	('CA', 'C10-0000670-LIC'),
	('CA', 'C10-0000695-LIC'),
	('CA', 'C10-0000698-LIC'),
	('CA', 'C10-0000700-LIC'),
	('CA', 'C10-0000707-LIC'),
	('CA', 'C10-0000731-LIC'),
	('CA', 'C10-0000748-LIC'),
	('CA', 'C10-0000749-LIC'),
	('CA', 'C10-0000753-LIC'),
	('CA', 'C10-0000758-LIC'),
	('CA', 'C10-0000759-LIC'),
	('CA', 'C10-0000774-LIC'),
	('CA', 'C10-0000776-LIC'),
	('CA', 'C10-0000786-LIC'),
	('CA', 'C10-0000801-LIC'),
	('CA', 'C10-0000802-LIC'),
	('CA', 'C10-0000805-LIC'),
	('CA', 'C10-0000816-LIC'),
	('CA', 'C10-0000817-LIC'),
	('CA', 'C10-0000824-LIC'),
	('CA', 'C10-0000827-LIC'),
	('CA', 'C10-0000849-LIC'),
	('CA', 'C10-0000865-LIC'),
	('CA', 'C10-0000869-LIC'),
	('CA', 'C10-0000874-LIC'),
	('CA', 'C10-0000885-LIC'),
	('CA', 'C10-0000888-LIC'),
	('CA', 'C10-0000898-LIC'),
	('CA', 'C10-0000899-LIC'),
	('CA', 'C10-0000903-LIC'),
	('CA', 'C10-0000915-LIC'),
	('CA', 'C10-0000916-LIC'),
	('CA', 'C10-0000918-LIC'),
	('CA', 'C10-0000922-LIC'),
	('CA', 'C10-0000937-LIC'),
	('CA', 'C10-0000939-LIC'),
	('CA', 'C10-0000946-LIC'),
	('CA', 'C10-0000982-LIC'),
	('CA', 'C10-0000986-LIC'),
	('CA', 'C10-0001020-LIC'),
	('CA', 'C10-0001021-LIC'),
	('CA', 'C10-0001025-LIC'),
	('CA', 'C10-0001096-LIC'),
	('CA', 'C10-0001165-LIC'),
	('CA', 'C10-0001166-LIC'),
	('CA', 'C10-0001168-LIC'),
	('CA', 'C10-0001184-LIC'),
	('CA', 'C10-0001200-LIC'),
	('CA', 'C12-0000026-LIC'),
	('CA', 'C12-0000087-LIC'),
	('CA', 'C12-0000119-LIC'),
	('CA', 'C12-0000170-LIC'),
	('CA', 'C12-0000191-LIC'),
	('CA', 'C12-0000249-LIC'),
	('CA', 'C12-0000302-LIC'),
	('CA', 'C12-0000333-LIC'),
	('CA', 'C12-0000334-LIC'),
	('CA', 'C12-0000350-LIC'),
	('CA', 'C12-0000359-LIC'),
	('CA', 'C12-0000398-LIC'),
	('CA', 'C12-0000400-LIC'),
	('CA', 'C12-0000405-LIC'),
	('CA', 'C9-0000016-LIC'),
	('CA', 'C9-0000046-LIC'),
	('CA', 'C9-0000056-LIC'),
	('CA', 'C9-0000057-LIC'),
	('CA', 'C9-0000082-LIC'),
	('CA', 'C9-0000094-LIC'),
	('CA', 'C9-0000105-LIC'),
	('CA', 'C9-0000130-LIC'),
	('CA', 'C9-0000136-LIC'),
	('CA', 'C9-0000146-LIC'),
	('CA', 'C9-0000154-LIC'),
	('CA', 'C9-0000157-LIC'),
	('CA', 'C9-0000166-LIC'),
	('CA', 'C9-0000167-LIC'),
	('CA', 'C9-0000170-LIC'),
	('CA', 'C9-0000247-LIC'),
	('CA', 'C9-0000263-LIC'),
	('CA', 'C9-0000300-LIC'),
	('CA', 'C9-0000320-LIC'),
	('CA', 'C9-0000323-LIC'),
	('CA', 'C9-0000327-LIC'),
	('CA', 'C9-0000341-LIC'),
	('CA', 'C9-0000348-LIC'),
	('CA', 'C9-0000370-LIC'),
	('CA', 'C9-0000385-LIC'),
	('CA', 'C9-0000399-LIC'),
	('CA', 'C9-0000402-LIC'),
	('CA', 'C9-0000412-LIC'),
	('CA', 'C9-0000423-LIC'),
	('CA', 'C9-0000427-LIC'),
	('CA', 'C9-0000441-LIC'),
	('CA', 'C9-0000444-LIC'),
	('CA', 'C9-0000451-LIC'),
	('CA', 'C9-0000454-LIC'),
	('CA', 'C9-0000464-LIC'),
	('CA', 'C9-0000467-LIC'),
	('CA', 'C9-0000491-LIC'),
	('CA', 'C9-0000510-LIC'),
	('CA', 'C9-0000526-LIC'),
	('CA', 'C9-0000551-LIC'),
	('CO', '402-00037'),
	('CO', '402-00251'),
	('CO', '402-00323'),
	('CO', '402-00370'),
	('CO', '402-00390'),
	('CO', '402-00455'),
	('CO', '402-00473'),
	('CO', '402-00558'),
	('CO', '402-00573'),
	('CO', '402-00664'),
	('CO', '402-00693'),
	('CO', '402-00840'),
	('CO', '402-00891'),
	('CO', '402-00930'),
	('CO', '402-01081'),
	('CO', '402-01142'),
	('CO', '402-01146'),
	('CO', '402-01201'),
	('CO', '402R-00002'),
	('CO', '402R-00017'),
	('CO', '402R-00020'),
	('CO', '402R-00035'),
	('CO', '402R-00041'),
	('CO', '402R-00066'),
	('CO', '402R-00193'),
	('CO', '402R-00296'),
	('CO', '402R-00515'),
	('CO', '402R-00536'),
	('CO', '402R-00544'),
	('CO', '402R-00545'),
	('CO', '402R-00573'),
	('CO', '402R-00574'),
	('CO', '402R-00587'),
	('CO', '402R-00602'),
	('CO', '402R-00640'),
	('CO', '402R-00744'),
	('CO', '402R-00747'),
	('CO', '402R-00781'),
	('CO', '402R-00804'),
	('CO', '402R-00807'),
	('CO', '402R-00895'),
	('CO', '402R-00900'),
	('MA', 'MR281525'),
	('MA', 'MR282131'),
	('MA', 'MR282316'),
	('MA', 'MR282376'),
	('MA', 'MR283073'),
	('MA', 'MR283231'),
	('MA', 'MR283369'),
	('MA', 'MR283416'),
	('MA', 'MR283723'),
	('MA', 'RMD1626-R'),
	('MD', 'D-17-00014'),
	('MD', 'D-18-00005'),
	('MI', 'AU-R-000150'),
	('MI', 'AU-R-000156'),
	('MI', 'AU-R-000163'),
	('MI', 'AU-R-000182'),
	('MI', 'AU-R-000196'),
	('MI', 'AU-R-000197'),
	('MI', 'AU-R-000198'),
	('MI', 'AU-R-000210'),
	('MI', 'AU-R-000229'),
	('MI', 'AU-R-000233'),
	('MI', 'AU-R-000250'),
	('MI', 'AU-R-000260'),
	('MI', 'AU-R-000261'),
	('MI', 'AU-R-000287'),
	('MI', 'AU-R-000346'),
	('MI', 'AU-R-000359'),
	('MI', 'AU-R-000366'),
	('MI', 'AU-R-000380'),
	('MI', 'AU-R-000422'),
	('MI', 'AU-R-000461'),
	('MI', 'AU-R-000462'),
	('MI', 'AU-R-000470'),
	('MI', 'AU-R-000489'),
	('MI', 'AU-R-000506'),
	('MI', 'AU-R-000535'),
	('MI', 'AU-R-000546'),
	('MI', 'AU-R-000559'),
	('MI', 'AU-R-000561'),
	('MI', 'AU-R-000572'),
	('MI', 'AU-R-000575'),
	('MI', 'AU-R-000633'),
	('MI', 'AU-R-000636'),
	('MI', 'AU-R-000677'),
	('MI', 'AU-R-000712'),
	('MI', 'AU-R-000719'),
	('MI', 'AU-R-000730'),
	('MI', 'AU-R-000731'),
	('MI', 'AU-R-000739'),
	('MI', 'AU-R-000789'),
	('MI', 'AU-R-000797'),
	('MI', 'AU-R-000812'),
	('MI', 'AU-R-000841'),
	('MI', 'AU-R-000856'),
	('MI', 'AU-R-000878'),
	('MI', 'PC-000006'),
	('MI', 'PC-000137'),
	('MI', 'PC-000160'),
	('MI', 'PC-000167'),
	('MI', 'PC-000169'),
	('MI', 'PC-000185'),
	('MI', 'PC-000205'),
	('MI', 'PC-000225'),
	('MI', 'PC-000231'),
	('MI', 'PC-000310'),
	('MI', 'PC-000334'),
	('MI', 'PC-000335'),
	('MI', 'PC-000356'),
	('MI', 'PC-000381'),
	('MI', 'PC-000383'),
	('MI', 'PC-000397'),
	('MI', 'PC-000415'),
	('MI', 'PC-000458'),
	('MI', 'PC-000466'),
	('MI', 'PC-000485'),
	('MI', 'PC-000551'),
	('MI', 'PC-000613'),
	('MI', 'PC-000718'),
	('MI', 'PC-000722'),
	('MI', 'PC-000725'),
	('OK', 'DAAA-4KQH-VZAN'),
	('OR', '050-10052885D4C'),
	('OR', '050-10055477B6C'),
	('OR', '050-10070593E9E'),
	('OR', '050-10111574ADA'),
	('OR', '050-10126938755'),
]

def main(is_test_run: bool) -> None:
	# For this backfill job, set SQL statement timeout to 10 seconds.
	engine = models.create_engine(statement_timeout=10000)
	session_maker = models.new_sessionmaker(engine)

	for metrc_sales_receipt_tuple in METRC_SALES_RECEIPT_TUPLES:
		BATCH_SIZE = 10
		current_page = 0
		is_done = False

		us_state, license_number = metrc_sales_receipt_tuple

		while not is_done:
			print(f'[{us_state}, {license_number}] Page {current_page}...')
			with models.session_scope(session_maker) as session:
				metrc_sales_receipts_batch = cast(
					List[models.MetrcSalesReceipt],
					session.query(models.MetrcSalesReceipt).filter(
						models.MetrcSalesReceipt.us_state == us_state
					).filter(
						models.MetrcSalesReceipt.license_number == license_number
					).order_by(
						models.MetrcSalesReceipt.receipt_id
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

				if len(metrc_sales_receipts_batch) <= 0:
					is_done = True
				else:
					for metrc_sales_receipt in metrc_sales_receipts_batch:
						new_payload = metrc_sales_receipt.payload.copy()
						is_payload_changed = False

						for special_pii_key in METRC_SALES_RECEIPT_SPECIAL_PII_KEYS:
							if special_pii_key in new_payload:
								new_payload.pop(special_pii_key)
								is_payload_changed = True

						if is_payload_changed:
							print(f'[{us_state}, {license_number}] Updating sales receipt {metrc_sales_receipt.id} payload...')
							if not is_test_run:
								metrc_sales_receipt.payload = new_payload
								flag_modified(metrc_sales_receipt, 'payload')

					current_page += 1

	print('SUCCESS!')

if __name__ == "__main__":
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	is_test_run = True

	if not os.environ.get("CONFIRM"):
		print("This script CHANGES information in the database")
		print("You must set 'CONFIRM=1' as an environment variable to actually perform database changes with this script")
	else:
		is_test_run = False

	main(is_test_run=is_test_run)
