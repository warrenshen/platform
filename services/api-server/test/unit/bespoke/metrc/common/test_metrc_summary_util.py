import datetime
import decimal
import json
import uuid
import unittest

from dateutil import parser
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Any, Dict, List, Tuple, NamedTuple, cast
from fastapi_utils.guid_type import GUID

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.metrc.common import metrc_common_util
from bespoke.metrc.common import metrc_error_util
from bespoke.metrc.common import metrc_summary_util
from bespoke.metrc.common.metrc_error_util import (
	MetrcErrorDetailsDict, BESPOKE_INTERNAL_ERROR_STATUS_CODE
)
from bespoke.metrc.common.metrc_common_util import (
	_get_date_str, SplitTimeBy
)
from bespoke.db.db_constants import (
	MetrcDownloadStatus, MetrcDownloadSummaryStatus
)
from bespoke.metrc import metrc_util
from bespoke.security import security_util

from bespoke_test.db import db_unittest, test_helper

def _update(orig: Dict, new_info: Dict) -> Dict:
	orig.update(new_info)
	return orig

class TestDownloadSummary(unittest.TestCase):

	def _get_default_expected_summary(self) -> Dict:
		return {
			'harvests_status': MetrcDownloadStatus.SUCCESS,
			'packages_status': MetrcDownloadStatus.SUCCESS,
			'plant_batches_status': MetrcDownloadStatus.SUCCESS,
			'plants_status': MetrcDownloadStatus.SUCCESS,
			'sales_status': MetrcDownloadStatus.SUCCESS,
			'transfers_status': MetrcDownloadStatus.SUCCESS
		}

	def _run_test(self, test: Dict, expected: Dict) -> None:
		cur_date_str = metrc_common_util._get_date_str(
			date_util.load_date_str('10/01/2020'))

		error_catcher = metrc_common_util.ErrorCatcher()
		for error_dict in test['errors']:
			error_catcher.add_retry_error(
				path=error_dict['path'],
				time_range=[cur_date_str],
				err_details=MetrcErrorDetailsDict(
					reason=error_dict['reason'],
					status_code=error_dict['status_code'],
					traceback=None
				)
			)

		summary = metrc_summary_util._get_download_summary(error_catcher.get_retry_errors())
		self.assertEqual(summary.status, expected['status'])
		self.assertEqual(summary.harvests_status, expected['harvests_status'])
		self.assertEqual(summary.packages_status, expected['packages_status'])
		self.assertEqual(summary.plant_batches_status, expected['plant_batches_status'])
		self.assertEqual(summary.plants_status, expected['plants_status'])
		self.assertEqual(summary.sales_status, expected['sales_status'])
		self.assertEqual(summary.transfers_status, expected['transfers_status'])
		if len(test['errors']) > 0:
			self.assertTrue(len(list(cast(Dict, summary.err_details).keys())) > 0)
		else:
			self.assertEqual(0, len(list(cast(Dict, summary.err_details).keys())))

	def test_success(self) -> None:
		# We skip over Access Denied when summarizing the final status 
		self._run_test(test={
			'errors': [
			]
		}, expected=_update(self._get_default_expected_summary(), {
			'status': MetrcDownloadSummaryStatus.COMPLETED,
		}))

	def test_success_but_packages_access_denied_not_total_failure(self) -> None:
		# We skip over Access Denied when summarizing the final status 
		self._run_test(test={
			'errors': [
				{
					'path': '/packages/inactive',
					'reason': 'Access Denied',
					'status_code': 401
				}
			]
		}, expected=_update(self._get_default_expected_summary(), {
			'status': MetrcDownloadSummaryStatus.COMPLETED,
			'packages_status': MetrcDownloadStatus.NO_ACCESS
		}))

	def test_packages_failure_metrc_error_needs_retry(self) -> None:
		# We skip over Access Denied when summarizing the final status 
		self._run_test(test={
			'errors': [
				{
					'path': '/packages/inactive',
					'reason': 'Internal Server Error',
					'status_code': 500
				}
			]
		}, expected=_update(self._get_default_expected_summary(), {
			'status': MetrcDownloadSummaryStatus.NEEDS_RETRY,
			'packages_status': MetrcDownloadStatus.METRC_SERVER_ERROR
		}))

	def test_packages_failure_bespoke_error_needs_retry(self) -> None:
		# We skip over Access Denied when summarizing the final status 
		self._run_test(test={
			'errors': [
				{
					'path': '/packages/inactive',
					'reason': 'Exception in code we wrote',
					'status_code': BESPOKE_INTERNAL_ERROR_STATUS_CODE
				}
			]
		}, expected=_update(self._get_default_expected_summary(), {
			'status': MetrcDownloadSummaryStatus.NEEDS_RETRY,
			'packages_status': MetrcDownloadStatus.BESPOKE_SERVER_ERROR
		}))

	def test_packages_failure_no_access_needs_retry(self) -> None:
		# We skip over Access Denied when summarizing the final status 
		self._run_test(test={
			'errors': [
				{
					# Access Denied gets pinned, regardless of what happens later
					'path': '/packages/active',
					'reason': 'Access Denied',
					'status_code': 401
				},
				{
					'path': '/packages/inactive',
					'reason': 'Exception in code we wrote',
					'status_code': BESPOKE_INTERNAL_ERROR_STATUS_CODE
				},
			]
		}, expected=_update(self._get_default_expected_summary(), {
			'status': MetrcDownloadSummaryStatus.NEEDS_RETRY,
			'packages_status': MetrcDownloadStatus.NO_ACCESS
		}))

	def test_packages_failure_skip_access_denied_needs_retry(self) -> None:
		# We skip over Access Denied when summarizing the final status 
		self._run_test(test={
			'errors': [
				{
					# Access Denied gets pinned, regardless of what happens later
					'path': '/packages/active',
					'reason': 'Internal Server Error',
					'status_code': 500
				},
				{
					'path': '/packages/inactive',
					'reason': 'Exception in code we wrote',
					'status_code': BESPOKE_INTERNAL_ERROR_STATUS_CODE
				},
			]
		}, expected=_update(self._get_default_expected_summary(), {
			'status': MetrcDownloadSummaryStatus.NEEDS_RETRY,
			'packages_status': MetrcDownloadStatus.METRC_SERVER_ERROR
		}))


class TestWriteDownloadSummary(db_unittest.TestCase):

	def _write_metrc_api_key(self, seed: test_helper.BasicSeed, company_index: int) -> str:
		security_cfg = security_util.ConfigDict(
			URL_SECRET_KEY='url-secret-key1234',
			URL_SALT='url-salt1234',
			BESPOKE_DOMAIN='https://app.bespokefinancial.com'
		)

		with session_scope(self.session_maker) as session:
			company_id = seed.get_company_id('company_admin', index=company_index)

			metrc_api_key_id, err = metrc_util.upsert_api_key(
				company_id=company_id,
				metrc_api_key_id=None,
				api_key='the-api-key',
				security_cfg=security_cfg,
				us_state='OR',
				session=session
			)
			self.assertIsNone(err)

			return metrc_api_key_id

	def _write_download_summary(self, test: Dict) -> None:
		cur_date = date_util.load_date_str(test['cur_date'])
		cur_date_str = metrc_common_util._get_date_str(cur_date)

		error_catcher = metrc_common_util.ErrorCatcher()
		for error_dict in test['errors']:
			error_catcher.add_retry_error(
				path=error_dict['path'],
				time_range=[cur_date_str],
				err_details=MetrcErrorDetailsDict(
					reason=error_dict['reason'],
					status_code=error_dict['status_code'],
					traceback=None
				)
			)

		with session_scope(self.session_maker) as session:
			metrc_summary_util.write_download_summary(
				retry_errors=error_catcher.get_retry_errors(),
				cur_date=cur_date,
				company_id=test['company_id'],
				metrc_api_key_id=test['metrc_api_key_id'],
				license_number=test['license_number'],
				session=session
			)

	def test_write_two_of_the_same_summaries(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		metrc_api_key_id = self._write_metrc_api_key(seed, company_index=0)
		company_id = seed.get_company_id('company_admin', index=0)

		test_input: Dict = {
			'cur_date': '10/01/2020',
			'company_id': company_id,
			'metrc_api_key_id': metrc_api_key_id,
			'license_number': 'abcd',
			'errors': []
		}
		self._write_download_summary(test_input)

		with session_scope(self.session_maker) as session:
			summary = session.query(models.MetrcDownloadSummary).first()
			self.assertEqual(company_id, str(summary.company_id))
			self.assertEqual(metrc_api_key_id, str(summary.metrc_api_key_id))
			self.assertEqual('abcd', summary.license_number)
			self.assertEqual(date_util.load_date_str('10/01/2020'), summary.date)
			self.assertEqual(0, summary.num_retries)
			self.assertEqual(MetrcDownloadSummaryStatus.COMPLETED, summary.status)

		test_input = {
			'cur_date': '10/01/2020',
			'company_id': company_id,
			'metrc_api_key_id': metrc_api_key_id,
			'license_number': 'abcd',
			'errors': [
				{
					# Access Denied gets pinned, regardless of what happens later
					'path': '/packages/active',
					'reason': 'Internal Server Error',
					'status_code': 500
				},
			]
		}
		self._write_download_summary(test_input)

		with session_scope(self.session_maker) as session:
			summaries = session.query(models.MetrcDownloadSummary).all()
			self.assertEqual(1, len(summaries))
			summary = summaries[0]

			self.assertEqual(company_id, str(summary.company_id))
			self.assertEqual(metrc_api_key_id, str(summary.metrc_api_key_id))
			self.assertEqual('abcd', summary.license_number)
			self.assertEqual(date_util.load_date_str('10/01/2020'), summary.date)
			self.assertEqual(1, summary.num_retries)
			self.assertEqual(MetrcDownloadSummaryStatus.NEEDS_RETRY, summary.status)

	def test_write_summaries_from_different_api_keys(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		metrc_api_key_id = self._write_metrc_api_key(seed, company_index=0)
		company_id = seed.get_company_id('company_admin', index=0)

		test_input: Dict = {
			'cur_date': '10/01/2020',
			'company_id': company_id,
			'metrc_api_key_id': metrc_api_key_id,
			'license_number': 'abcd',
			'errors': []
		}
		self._write_download_summary(test_input)

		with session_scope(self.session_maker) as session:
			summary = session.query(models.MetrcDownloadSummary).first()
			self.assertEqual(company_id, str(summary.company_id))
			self.assertEqual(metrc_api_key_id, str(summary.metrc_api_key_id))
			self.assertEqual('abcd', summary.license_number)
			self.assertEqual(date_util.load_date_str('10/01/2020'), summary.date)
			self.assertEqual(0, summary.num_retries)
			self.assertEqual(MetrcDownloadSummaryStatus.COMPLETED, summary.status)

		metrc_api_key_id1 = self._write_metrc_api_key(seed, company_index=0)
		test_input = {
			'cur_date': '10/01/2020',
			'company_id': company_id,
			'metrc_api_key_id': metrc_api_key_id1,
			'license_number': 'abcd',
			'errors': [
				{
					# Access Denied gets pinned, regardless of what happens later
					'path': '/packages/active',
					'reason': 'Internal Server Error',
					'status_code': 500
				},
			]
		}
		self._write_download_summary(test_input)

		with session_scope(self.session_maker) as session:
			summaries = session.query(models.MetrcDownloadSummary).all()
			self.assertEqual(2, len(summaries))
