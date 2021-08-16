from typing import List, Dict, Callable, cast

from bespoke.db import models
from bespoke.db.models import session_scope

def get_active_inventory(company_id: str, session_maker: Callable) -> Dict:

	with session_scope(session_maker) as session:
		metrc_packages = cast(List[models.MetrcPackage], 
			session.query(models.MetrcPackage).filter(
			models.MetrcPackage.company_id == company_id
		).filter(models.MetrcPackage.type == 'active').all())

	col_names = ['ID']
	rows = []
	for metrc_package in metrc_packages:
		row = [
			str(metrc_package.id)
		]
		rows.append(row)

	return {
			'status': 'OK',
			'col_names': col_names,
			'rows': rows
		}