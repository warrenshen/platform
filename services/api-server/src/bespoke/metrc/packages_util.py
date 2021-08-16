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

	def get_models(self, company_id: str) -> List[PackageObject]:
		package_objs = []

		for i in range(len(self._packages)):
			package = self._packages[i]
			package_id = '{}'.format(package['Id'])

			p = models.MetrcPackage()
			p.type = self._endpoint_type
			p.company_id = cast(Any, company_id)
			p.package_id = package_id
			p.package_label = package['Label']
			p.package_type = package['PackageType']
			p.product_name = package.get('ProductName')
			p.product_category_name = package.get('ProductCategoryName')
			p.shipped_quantity = package.get('ShippedQuantity')
			p.lab_results_status = UNKNOWN_LAB_STATUS

			p.package_payload = self._rewrite_payload(package)

			package_objs.append(PackageObject(p))

		return package_objs



def download_packages(ctx: metrc_common_util.DownloadContext) -> List[PackageObject]:
	# NOTE: Sometimes there are a lot of inactive packages to pull for a single day
	# and this makes it look like the sync is stuck / hanging - could be good to
	# change this logic to use smaller (intraday) time ranges to prevent this.
	active_packages: List[Dict] = []
	inactive_packages: List[Dict] = []
	onhold_packages: List[Dict] = []

	company_info = ctx.company_info
	cur_date_str = ctx.get_cur_date_str()
	request_status = ctx.request_status
	rest = ctx.rest

	try:
		resp = rest.get('/packages/v1/active', time_range=[cur_date_str])
		active_packages = json.loads(resp.content)
		request_status['packages_api'] = 200
	except errors.Error as e:
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

	active_package_models = Packages(active_packages, 'active').get_models(
		company_id=company_info.company_id
	)
	inactive_package_models = Packages(inactive_packages, 'inactive').get_models(
		company_id=company_info.company_id
	)
	onhold_package_models = Packages(onhold_packages, 'onhold').get_models(
		company_id=company_info.company_id
	)

	if active_packages:
		logging.info('Downloaded {} active packages for {} on {}'.format(
			len(active_package_models), company_info.name, ctx.cur_date))

	if inactive_packages:
		logging.info('Downloaded {} inactive packages for {} on {}'.format(
			len(inactive_package_models), company_info.name, ctx.cur_date))

	if onhold_packages:
		logging.info('Downloaded {} on hold packages for {} on {}'.format(
			len(onhold_package_models), company_info.name, ctx.cur_date))

	package_models = active_package_models + inactive_package_models + onhold_package_models
	return package_models

def _write_packages_chunk(
	packages: List[PackageObject],
	session: Session) -> None:
	package_ids = [package.metrc_package.package_id for package in packages] 

	# metrc_packages are unique on package_id, when they 
	# are not associated with a delivery.
	# Note the following query may return more than BATCH_SIZE number of results.
	prev_metrc_packages = cast(List[models.MetrcPackage], session.query(models.MetrcPackage).filter(
		models.MetrcPackage.package_id.in_(package_ids)
	).filter(models.MetrcPackage.delivery_row_id == None).all())

	package_id_to_prev_package = {}
	for prev_metrc_package in prev_metrc_packages:
		# Package key is a tuple of (delivery_id, package_id) - the
		# same package may show up in multiple different deliveries.
		metrc_package_key = prev_metrc_package.package_id
		package_id_to_prev_package[metrc_package_key] = prev_metrc_package

	# Write the packages
	for package in packages:
		metrc_package = package.metrc_package
		metrc_package_key = metrc_package.package_id

		if metrc_package_key in package_id_to_prev_package:
			# update
			prev_metrc_package = package_id_to_prev_package[metrc_package_key]
			package_common_util.merge_into_prev_package(
				prev=prev_metrc_package, 
				cur=metrc_package
			)
		else:
			# add
			session.add(metrc_package)
			session.flush()

		# In some rare cases, a new package may show up twice in the same day.
		# The following line prevents an attempt to insert a duplicate package.
		package_id_to_prev_package[metrc_package_key] = metrc_package

def write_packages(packages_models: List[PackageObject], session_maker: Callable) -> None:
	BATCH_SIZE = 50
	batch_index = 1

	batches_count = len(packages_models) // BATCH_SIZE + 1
	for packages_chunk in chunker(packages_models, BATCH_SIZE):
		logging.info(f'Writing packages batch {batch_index} of {batches_count}...')
		with session_scope(session_maker) as session:
			_write_packages_chunk(packages_chunk, session)
		batch_index += 1

