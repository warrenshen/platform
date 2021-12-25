import logging
import datetime
import json
import requests

from dateutil import parser
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Any, Callable, List, Tuple, Dict, cast

from bespoke import errors
from bespoke.db import models
from bespoke.db.db_constants import PackageType
from bespoke.db.models import session_scope
from bespoke.metrc.common import metrc_common_util, package_common_util
from bespoke.metrc.common.package_common_util import UNKNOWN_LAB_STATUS
from bespoke.metrc.common.metrc_common_util import chunker

class PackageObject(object):
	
	def __init__(self, metrc_package: models.MetrcPackage) -> None:
		self.metrc_package = metrc_package

class Packages(object):
	"""
		A collection of packages coming from /active, /inactive, /onhold
	"""

	def __init__(self, packages: List[Dict], endpoint_type: str) -> None:
		self._packages = packages
		self._endpoint_type = endpoint_type

	def _rewrite_payload(self, payload: Dict) -> Dict:
		# Rewrite the package payload to look more like the flattened version
		# which /transfers/v1/delivery/{id}/packages use

		item_json = payload.get('Item')
		if not item_json:
			return payload

		for k, v in item_json.items():
			new_key = 'Item{}'.format(k)
			payload[new_key] = v

		del payload['Item']

		return payload

	def filter_new_only(self, ctx: metrc_common_util.DownloadContext, session: Session) -> 'Packages':
		"""
			Only keep packages which are newly updated, e.g.,
			last_modified_at > db.last_modified_at.

			This prevents us from modifying packages where we know they haven't changed.
		"""

		us_state = ctx.license['us_state']
		package_ids = ['{}'.format(p['Id']) for p in self._packages]
		prev_packages = package_common_util.get_prev_metrc_packages(
			us_state, package_ids, session)

		package_id_to_package = {}
		for prev_metrc_package in prev_packages:
			package_id_to_package[prev_metrc_package.package_id] = prev_metrc_package

		new_packages = []
		for p in self._packages:
			cur_package_id = '{}'.format(p['Id']) 
			if cur_package_id in package_id_to_package:
				prev_package = package_id_to_package[cur_package_id]
				if prev_package.last_modified_at >= parser.parse(p['LastModified']):
					# If we've seen a previous package that's at the same last_modified_at
					# or newer than what we just fetched, no need to use it again
					continue
			
			new_packages.append(p)

		self._packages = new_packages		

		return self

	def get_models(self, ctx: metrc_common_util.DownloadContext) -> List[PackageObject]:
		company_id = ctx.company_details['company_id']
		license_number = ctx.license['license_number']
		us_state = ctx.license['us_state']

		package_objs = []
		for i in range(len(self._packages)):
			package = self._packages[i]
			package_id = '{}'.format(package['Id'])

			p = models.MetrcPackage()
			p.type = self._endpoint_type
			p.license_number = license_number
			p.us_state = us_state
			p.company_id = cast(Any, company_id)
			p.package_id = package_id
			p.package_label = package['Label']
			p.package_type = package['PackageType']
			item = package['Item']
			p.product_name = item['Name']
			p.product_category_name = item['ProductCategoryName']
			p.last_modified_at = parser.parse(package['LastModified'])
			p.packaged_date = parser.parse(package['PackagedDate'])
			p.quantity = package['Quantity']
			p.unit_of_measure = package['UnitOfMeasureName']

			p.package_payload = self._rewrite_payload(package)

			package_objs.append(PackageObject(p))

		return package_objs



def download_packages(ctx: metrc_common_util.DownloadContext, session_maker: Callable) -> List[PackageObject]:
	# NOTE: Sometimes there are a lot of inactive packages to pull for a single day
	# and this makes it look like the sync is stuck / hanging - could be good to
	# change this logic to use smaller (intraday) time ranges to prevent this.
	active_packages: List[Dict] = []
	inactive_packages: List[Dict] = []
	onhold_packages: List[Dict] = []

	company_details = ctx.company_details
	cur_date_str = ctx.get_cur_date_str()
	request_status = ctx.request_status
	rest = ctx.rest

	try:
		resp = rest.get('/packages/v1/active', time_range=[cur_date_str])
		active_packages = json.loads(resp.content)
		request_status['packages_api'] = 200
	except errors.Error as e:
		logging.error(e)
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'packages_api', e)

	try:
		resp = rest.get('/packages/v1/inactive', time_range=[cur_date_str])
		inactive_packages = json.loads(resp.content)
		request_status['packages_api'] = 200
	except errors.Error as e:
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'packages_api', e)

	try:
		resp = rest.get('/packages/v1/onhold', time_range=[cur_date_str])
		onhold_packages = json.loads(resp.content)
		request_status['packages_api'] = 200
	except errors.Error as e:
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'packages_api', e)

	license_number = ctx.license['license_number']

	with session_scope(session_maker) as session:
		active_package_models = Packages(
			active_packages, PackageType.ACTIVE).filter_new_only(ctx, session).get_models(ctx=ctx)
	
	with session_scope(session_maker) as session:
		inactive_package_models = Packages(
			inactive_packages, PackageType.INACTIVE).filter_new_only(ctx, session).get_models(ctx=ctx)
	
	with session_scope(session_maker) as session:
		onhold_package_models = Packages(
			onhold_packages, PackageType.ONHOLD).filter_new_only(ctx, session).get_models(ctx=ctx)

	if active_packages:
		logging.info('Downloaded {} active packages for {} on {}'.format(
			len(active_package_models), company_details['name'], ctx.cur_date))

	if inactive_packages:
		logging.info('Downloaded {} inactive packages for {} on {}'.format(
			len(inactive_package_models), company_details['name'], ctx.cur_date))

	if onhold_packages:
		logging.info('Downloaded {} on hold packages for {} on {}'.format(
			len(onhold_package_models), company_details['name'], ctx.cur_date))

	package_models = active_package_models + inactive_package_models + onhold_package_models
	
	if not package_models:
		logging.info('No new packages to write for {} on {}'.format(
			company_details['name'], ctx.cur_date
		))

	return package_models

def write_packages(packages_models: List[PackageObject], session_maker: Callable, BATCH_SIZE: int = 50) -> None:
	batch_index = 1

	batches_count = len(packages_models) // BATCH_SIZE + 1
	for package_models_chunk in chunker(packages_models, BATCH_SIZE):
		logging.info(f'Writing packages batch {batch_index} of {batches_count}...')
		with session_scope(session_maker) as session:
			packages_chunk = [package.metrc_package for package in package_models_chunk]
			package_common_util.update_packages(
				packages_chunk,
				session=session
			)
		batch_index += 1

