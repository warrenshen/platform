from typing import Callable, cast, Tuple

from bespoke import errors
from bespoke.db import models
from bespoke.security import security_util
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

ViewApiKeyRespDict = TypedDict('ViewApiKeyRespDict', {
	'api_key': str,
	'us_state': str,
	'use_saved_licenses_only': bool
})

@errors.return_error_tuple
def delete_api_key(
	metrc_api_key_id: str,
	session: Session
) -> Tuple[bool, errors.Error]:

	metrc_api_key = cast(
		models.MetrcApiKey,
		session.query(models.MetrcApiKey).filter(
			models.MetrcApiKey.id == metrc_api_key_id
		).first())
	if not metrc_api_key:
		raise errors.Error('Metrc API Key to delete does not exist in the database')

	if metrc_api_key.is_deleted:
		raise errors.Error('The key is already deleted')

	metrc_api_key.is_deleted = True

	return True, None

@errors.return_error_tuple
def upsert_api_key(
	company_id: str,
	metrc_api_key_id: str,
	api_key: str,
	security_cfg: security_util.ConfigDict,
	us_state: str,
	use_saved_licenses_only: bool,
	session: Session
) -> Tuple[str, errors.Error]:
	"""
	use_saved_licenses_only
	- If True, only download Metrc data for licenses that are connected to company in the database.
	- This is intended to be used in situations where multiple companies share the same Metrc API key,
	- for example when each company relates to one location.
	"""
	if not us_state:
		raise errors.Error('US state must be specified to create or update a metrc API key')

	company = cast(
		models.Company,
		session.query(models.Company).filter(
			models.Company.id == company_id
		).first())

	if not company:
		raise errors.Error('No company found with company ID provided')

	hashed_key = security_util.encode_secret_string(
		security_cfg, api_key, serializer_type=security_util.SerializerType.SERIALIZER
	)
	existing_metrc_api_key = cast(
		models.MetrcApiKey,
		session.query(models.MetrcApiKey).filter(
			cast(Callable, models.MetrcApiKey.is_deleted.isnot)(True)
		).filter(
			models.MetrcApiKey.hashed_key == hashed_key
		).first())

	# NOTE: if NOT use_saved_licenses_only, prevent duplicate Metrc API keys,
	# even in the case where previous key is soft-deleted.
	if existing_metrc_api_key and str(existing_metrc_api_key.id) != metrc_api_key_id and not use_saved_licenses_only:
		raise errors.Error(f'Cannot store a duplicate metrc API key that is already registered to company_id="{existing_metrc_api_key.company_id}"')

	if metrc_api_key_id:
		# The "edit" case
		metrc_api_key = cast(
			models.MetrcApiKey,
			session.query(models.MetrcApiKey).filter(
				models.MetrcApiKey.id == metrc_api_key_id
			).first())
		if not metrc_api_key:
			raise errors.Error('Previously existing Metrc API Key does not exist in the database')

		metrc_api_key.hashed_key = hashed_key
		metrc_api_key.encrypted_api_key = security_util.encode_secret_string(
			security_cfg, api_key
		)
		metrc_api_key.us_state = us_state
		metrc_api_key.use_saved_licenses_only = use_saved_licenses_only

		return str(metrc_api_key.id), None
	else:
		# The "add" case
		metrc_api_key = models.MetrcApiKey()
		metrc_api_key.company_id = company.id
		metrc_api_key.hashed_key = hashed_key
		metrc_api_key.encrypted_api_key = security_util.encode_secret_string(security_cfg, api_key)
		metrc_api_key.us_state = us_state
		metrc_api_key.use_saved_licenses_only = use_saved_licenses_only
		session.add(metrc_api_key)
		session.flush()
		return str(metrc_api_key.id), None

@errors.return_error_tuple
def view_api_key(
	metrc_api_key_id: str,
	security_cfg: security_util.ConfigDict,
	session: Session
) -> Tuple[ViewApiKeyRespDict, errors.Error]:
	metrc_api_key = cast(
		models.MetrcApiKey,
		session.query(models.MetrcApiKey).filter(
			models.MetrcApiKey.id == metrc_api_key_id
		).first())

	if not metrc_api_key:
		raise errors.Error('No metrc api key found, so we could not present the underlying key')

	if metrc_api_key.is_deleted:
		raise errors.Error('Metrc api key is deleted, so we could not present the underlying key')

	api_key = security_util.decode_secret_string(
		security_cfg, metrc_api_key.encrypted_api_key
	)

	return ViewApiKeyRespDict(
		api_key=api_key,
		us_state=metrc_api_key.us_state,
		use_saved_licenses_only=metrc_api_key.use_saved_licenses_only
	), None
