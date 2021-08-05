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
from bespoke.metrc import metrc_common_util
from bespoke.metrc.metrc_common_util import chunker

class SalesReceipts(object):

	def __init__(self, sales_receipts: List[Dict], receipt_type: str) -> None:
		self._sales_receipts = sales_receipts
		self._type = receipt_type

	def get_sales_receipt_models(self, company_id: str) -> List[models.MetrcSalesReceipt]:
		sales_receipts = []
		for i in range(len(self._sales_receipts)):
			s = self._sales_receipts[i]
			receipt = models.MetrcSalesReceipt()
			receipt.type = self._type
			receipt.company_id = cast(Any, company_id)
			receipt.receipt_number = s['ReceiptNumber']
			receipt.sales_customer_type = s['SalesCustomerType']
			receipt.sales_datetime = parser.parse(s['SalesDateTime'])
			receipt.total_packages = s['TotalPackages']
			receipt.total_price = s['TotalPrice']
			receipt.is_final = s['IsFinal']
			receipt.payload = s
			sales_receipts.append(receipt)

		return sales_receipts

def download_sales_receipts(ctx: metrc_common_util.DownloadContext) -> List[models.MetrcSalesReceipt]:
	# NOTE: Sometimes there are a lot of inactive receipts to pull for a single day
	# and this makes it look like the sync is stuck / hanging - could be good to
	# change this logic to use smaller (intraday) time ranges to prevent this.
	active_sales_receipts = []
	inactive_sales_receipts: List[Dict] = []

	company_info = ctx.company_info
	cur_date_str = ctx.get_cur_date_str()
	request_status = ctx.request_status
	rest = ctx.rest

	try:
		resp = rest.get('/sales/v1/receipts/inactive', time_range=[cur_date_str])
		inactive_sales_receipts = json.loads(resp.content)
		request_status['receipts_api'] = 200
	except errors.Error as e:
		request_status['receipts_api'] = e.details.get('status_code')

	try:
		resp = rest.get('/sales/v1/receipts/active', time_range=[cur_date_str])
		active_sales_receipts = json.loads(resp.content)
		request_status['receipts_api'] = 200
	except errors.Error as e:
		request_status['receipts_api'] = e.details.get('status_code')

	active_sales_receipts_models = SalesReceipts(active_sales_receipts, 'active').get_sales_receipt_models(
		company_id=company_info.company_id
	)
	inactive_sales_receipts_models = SalesReceipts(inactive_sales_receipts, 'inactive').get_sales_receipt_models(
		company_id=company_info.company_id
	)

	logging.info('Downloaded {} active sales receipts for {} on {}'.format(
		len(active_sales_receipts_models), company_info.name, ctx.cur_date))
	logging.info('Downloaded {} inactive sales receipts for {} on {}'.format(
		len(inactive_sales_receipts_models), company_info.name, ctx.cur_date))

	sales_receipts_models = active_sales_receipts_models + inactive_sales_receipts_models
	return sales_receipts_models

def _write_sales_receipts_chunk(
	sales_receipts: List[models.MetrcSalesReceipt],
	session: Session) -> None:
	receipt_numbers = [receipt.receipt_number for receipt in sales_receipts] 

	prev_sales_receipts = session.query(models.MetrcSalesReceipt).filter(
		models.MetrcSalesReceipt.receipt_number.in_(receipt_numbers)
	)

	receipt_number_to_sales_receipt = {}
	for prev_sales_receipt in prev_sales_receipts:
		receipt_number_to_sales_receipt[prev_sales_receipt.receipt_number] = prev_sales_receipt

	for sales_receipt in sales_receipts:
		if sales_receipt.receipt_number in receipt_number_to_sales_receipt:
			# update
			prev = receipt_number_to_sales_receipt[sales_receipt.receipt_number]
			prev.type = sales_receipt.type
			prev.company_id = sales_receipt.company_id
			prev.sales_customer_type = sales_receipt.sales_customer_type
			prev.sales_datetime = sales_receipt.sales_datetime
			prev.total_packages = sales_receipt.total_packages
			prev.total_price = sales_receipt.total_price
			prev.payload = sales_receipt.payload
		else:
			# add
			session.add(sales_receipt)
			# In some rare cases, a new sales receipt may show up twice in the same day.
			# The following line prevents an attempt to insert a duplicate.
			receipt_number_to_sales_receipt[sales_receipt.receipt_number] = sales_receipt

def write_sales_receipts(sales_receipts_models: List[models.MetrcSalesReceipt], session_maker: Callable) -> None:
	SALES_BATCH_SIZE = 50
	batch_index = 1

	batches_count = len(sales_receipts_models) // SALES_BATCH_SIZE + 1
	for sales_chunk in chunker(sales_receipts_models, SALES_BATCH_SIZE):
		logging.info(f'Writing sales receipts batch {batch_index} of {batches_count}...')
		with session_scope(session_maker) as session:
			_write_sales_receipts_chunk(sales_chunk, session)
		batch_index += 1

