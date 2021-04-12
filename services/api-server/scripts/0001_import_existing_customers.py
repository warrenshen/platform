import os
import sys
from os import path

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../src")))
from bespoke.db import models
from bespoke.db.db_constants import CompanyType

# name, identifier, contract_name
NEW_CUSTOMER_TUPLES = [
	('ThirtyOne Labs', '31L', 'BPX, LLC'),
    ('Leune', 'LU', 'KANIYO CO.'),
    ('Good Tree', 'GT', 'GOOD TREE HOLDINGS, LLC'),
    ('JC Rad', 'JC', 'JC RAD, INC.'),
    ('Cannary', 'CAN', '4033002 (DBA CANNARY DISTRIBUTION)'),
    ('The Adventure Challenge', 'AC', 'THE ADVENTURE CHALLENGE LLC'),
    ('SD Strains', 'SD', 'SD STRAINS, INC.'),
    ('Royal Apothecary', 'RA', 'ROYAL APOTHECARY, LLC'),
    ('EPOD', 'EP', 'EPOD HOLDINGS LLC'),
    ('Lobo Cannagar', 'LC', 'LOBO FUERTE LLC'),
    ('Voyage', 'VOY', 'VOYAGE DISTRIBUTION, INC.'),
    ('HTC', 'HTC', 'HTC SOLUTIONS INC'),
    ('Luminescence Labs', 'LL', 'LUMINESCENCE LABS, INC.'),
    ('Pioneer Valley', 'PV', 'PIONEER VALLEY EXTRACTS LLC'),
    ('Heaven Scent Health and Wellness', 'HSW', 'HEAVEN SCENT HEALTH AND WELLNESS INC.'),
    ('Boro Family Farms', 'BFF', 'BORO FAMILY FARMS LLC'),
    ('Pura Cali', 'PC', 'HUMBOLDT JG GROUP, LLC'),
    ('Greenleaf', 'GP', 'GREENLEAF PROCESSORS INC.'),
    ('Herer Group', 'HG', 'HHC GLOBAL CORP'),
    ('Humboldt Farms', 'HF', 'HORIZON LGG, LLC'),
    ('Desert Road', 'DR', 'DESERT ROAD DISTRIBUTION, LLC'),
    ('Biscotti', 'BIS', 'BISCOTTI BRANDS LLC'),
    ('5MIL', '5MIL', '5MIL LOGISTICS, INC.'),
    ('Dreamfields', 'DF', 'MED FOR AMERICA INC.'),
    ('Umbrla', 'UM', 'LTCA MANAGEMENT LLC'),
    ('Friendly Farms', 'FF', 'WTO ESSENTIALS INC.'),
    ('Flowerhired', 'FH', 'FLOWERHIRED INC.'),
    ('Space Coyote', 'SC', 'LAND SEAL DEVELOPMENT, INC.'),
    ('Kalifornia Green Akres', 'KGA', 'KALIFORNIA GREEN AKRES'),
    ('iCANNiC', 'IC', 'PROMINENT INVESTMENTS INC.'),
    ('Buddies', 'BD', 'HASH TAG DISTRIBUTION INC.'),
    ('Sisu', 'SU', 'SISU EXTRACTION, LLC'),
    ('DNA Organics', 'DNA', 'DNA ORGANICS, INC.'),
    ('Hueneme Patient Consumer Collective', 'HPCC', 'HUENEME PATIENT CONSUMER COLLECTIVE LLC'),
    ('Floramye', 'FL', 'FLORAMYE LLC'),
    ('Accentian', 'ACT', 'ACCENTIAN, INC.'),
    ('Kat\'s Naturals', 'KN', 'KAT\'S NATURALS, INC.'),
    ('Grupo Flor', 'GF', 'FLOR X, INC.'),
]

def import_existing_customers(session: Session) -> None:
	customers_count = len(NEW_CUSTOMER_TUPLES)
	print(f'Creating {customers_count} customers...')

	for index, new_customer_tuple in enumerate(NEW_CUSTOMER_TUPLES):
		name, identifier, contract_name = new_customer_tuple

		company_settings = models.CompanySettings()
		session.add(company_settings)

		session.flush()
		company_settings_id = str(company_settings.id)

		company = models.Company(
			company_settings_id=company_settings_id,
			company_type=CompanyType.Customer,
			name=name,
			identifier=identifier,
			contract_name=contract_name,
		)
		session.add(company)
		session.flush()

		company_id = str(company.id)

		company_settings.company_id = company_id
		session.flush()
		print(f'[{index + 1} of {customers_count}] Created customer {company.name} ({company.identifier})')

def main() -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		import_existing_customers(session)

if __name__ == "__main__":
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)
	main()
