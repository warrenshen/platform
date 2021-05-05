import datetime
import decimal
import json
from sqlalchemy.orm.session import Session
from typing import Any, Callable, Dict, List, Optional, Tuple, cast

from bespoke import errors
from bespoke.db import models

@errors.return_error_tuple
def update_licenses(
	company_id: str,
	file_ids: List[str],
	session: Session,
) -> Tuple[List[str], errors.Error]:
	is_create_purchase_order = False

	if not company_id:
		raise errors.Error('Company ID is required')

	if not file_ids:
		raise errors.Error('File IDs are required')

	existing_licenses = cast(
		List[models.CompanyLicense],
		session.query(models.CompanyLicense).filter(
			models.CompanyLicense.company_id == company_id
		).all())

	if not existing_licenses:
		existing_licenses = []

	for existing_license in existing_licenses:
		cast(Callable, session.delete)(existing_license)

	session.flush()

	new_license_ids = []
	for file_id in file_ids:
		new_license = models.CompanyLicense( # type: ignore
			company_id=company_id, 
			file_id=file_id
		)
		session.add(new_license)
		session.flush()
		new_license_ids.append(str(new_license.id))

	return new_license_ids, None
