import datetime
import decimal
import json
from sqlalchemy.orm.session import Session
from typing import Any, Callable, Dict, List, Optional, Tuple, cast

from bespoke import errors
from bespoke.db import models

@errors.return_error_tuple
def delete_license(
	company_id: str,
	file_id: str,
	session: Session,
) -> Tuple[bool, errors.Error]:

	if not company_id:
		raise errors.Error('Company ID is required')

	if not file_id:
		raise errors.Error('File ID is required')

	existing_license = cast(
		List[models.CompanyLicense],
		session.query(models.CompanyLicense).filter(
			models.CompanyLicense.company_id == company_id
		).filter(
			models.CompanyLicense.file_id == file_id
		).first())

	if not existing_license:
		raise errors.Error('No file to delete could be found')

	cast(Callable, session.delete)(existing_license)

	return True, None

@errors.return_error_tuple
def add_licenses(
	company_id: str,
	file_ids: List[str],
	session: Session,
) -> Tuple[List[str], errors.Error]:

	if not company_id:
		raise errors.Error('Company ID is required')

	if not file_ids:
		raise errors.Error('File IDs are required')

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
