import logging
import datetime
import json
import requests

from dateutil import parser
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Any, Callable, List, Iterable, Tuple, Dict, cast

from bespoke import errors
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.metrc.common import metrc_common_util, package_common_util
from bespoke.metrc.common.metrc_common_util import chunker


class SalesTransactions(object):

	def __init__(self, sales_transactions: List[Dict], transaction_type: str) -> None:
		self._sales_transactions = sales_transactions
		self._type = transaction_type

	def get_sales_transactions_models(self, company_id: str, license_number: str, receipt_id: str) -> List[models.MetrcSalesTransaction]:
		sales_transactions = []
		for i in range(len(self._sales_transactions)):
			tx = self._sales_transactions[i]
			sales_tx = models.MetrcSalesTransaction()
			sales_tx.type = self._type
			sales_tx.license_number = license_number
			sales_tx.company_id = cast(Any, company_id)
			sales_tx.package_id = '{}'.format(tx['PackageId'])
			sales_tx.package_label = tx['PackageLabel']
			sales_tx.product_name = tx['ProductName']
			sales_tx.product_category_name = tx['ProductCategoryName']
			sales_tx.quantity_sold = tx['QuantitySold']
			sales_tx.unit_of_measure = tx['UnitOfMeasureName']
			sales_tx.total_price = tx['TotalPrice']
			sales_tx.recorded_datetime = parser.parse(tx['RecordedDateTime'])
			sales_tx.last_modified_at = parser.parse(tx['LastModified'])
			sales_tx.receipt_id = receipt_id
			sales_tx.payload = tx

			sales_transactions.append(sales_tx)

		return sales_transactions

class SalesReceiptObj(object):

	def __init__(self, receipt: models.MetrcSalesReceipt, transactions: List[models.MetrcSalesTransaction]) -> None:
		self.metrc_receipt = receipt
		self.transactions = transactions

class SalesReceipts(object):

	def __init__(self, sales_receipts: List[Dict], receipt_type: str) -> None:
		self._sales_receipts = sales_receipts
		self._type = receipt_type

	def get_sales_receipt_models(self, ctx: metrc_common_util.DownloadContext, company_id: str, cur_date: datetime.date) -> List[SalesReceiptObj]:
		sales_receipt_objs = []
		LOG_EVERY = 10
		license_number = ctx.license['license_number']

		for i in range(len(self._sales_receipts)):
			s = self._sales_receipts[i]
			receipt = models.MetrcSalesReceipt()
			receipt.type = self._type
			receipt.license_number = license_number
			receipt.company_id = cast(Any, company_id)
			receipt.receipt_id = '{}'.format(s['Id'])
			receipt.receipt_number = s['ReceiptNumber']
			receipt.sales_customer_type = s['SalesCustomerType']
			receipt.sales_datetime = parser.parse(s['SalesDateTime'])
			receipt.total_packages = s['TotalPackages']
			receipt.total_price = s['TotalPrice']
			receipt.is_final = s['IsFinal']
			receipt.last_modified_at = parser.parse(s['LastModified'])
			receipt.payload = s

			if i % LOG_EVERY == 0:
				logging.info('Downloading transaction #{} for company {} on day {}'.format(i, company_id, cur_date))

			if ctx.apis_to_use['sales_transactions']:
				resp = ctx.rest.get('/sales/v1/receipts/{}'.format(receipt.receipt_id))
				receipt_resp = json.loads(resp.content)
				transactions = SalesTransactions(receipt_resp['Transactions'], self._type).get_sales_transactions_models(
					company_id=company_id,
					license_number=license_number,
					receipt_id=receipt.receipt_id
				)
				ctx.request_status['sales_transactions_api'] = 200
			else:
				transactions = []

			sales_receipt_objs.append(SalesReceiptObj(
				receipt=receipt,
				transactions=transactions
			))

		return sales_receipt_objs

def download_sales_info(ctx: metrc_common_util.DownloadContext) -> List[SalesReceiptObj]:
	# NOTE: Sometimes there are a lot of inactive receipts to pull for a single day
	# and this makes it look like the sync is stuck / hanging - could be good to
	# change this logic to use smaller (intraday) time ranges to prevent this.
	active_sales_receipts: List[Dict] = []
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
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'receipts_api', e)

	try:
		resp = rest.get('/sales/v1/receipts/active', time_range=[cur_date_str])
		active_sales_receipts = json.loads(resp.content)
		request_status['receipts_api'] = 200
	except errors.Error as e:
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'receipts_api', e)

	active_sales_receipts_models = SalesReceipts(active_sales_receipts, 'active').get_sales_receipt_models(
		ctx=ctx,
		company_id=company_info.company_id,
		cur_date=ctx.cur_date
	)
	inactive_sales_receipts_models = SalesReceipts(inactive_sales_receipts, 'inactive').get_sales_receipt_models(
		ctx=ctx,
		company_id=company_info.company_id,
		cur_date=ctx.cur_date
	)

	num_transactions = sum([len(sales_receipt_model.transactions) for sales_receipt_model in active_sales_receipts_models])

	if active_sales_receipts:
		logging.info('Downloaded {} active sales receipts with {} transactions for {} on {}'.format(
			len(active_sales_receipts_models), num_transactions, company_info.name, ctx.cur_date))
	
	if inactive_sales_receipts:
		logging.info('Downloaded {} inactive sales receipts for {} on {}'.format(
			len(inactive_sales_receipts_models), company_info.name, ctx.cur_date))

	sales_receipts_models = active_sales_receipts_models + inactive_sales_receipts_models
	return sales_receipts_models

def _write_sales_transactions_chunk(
	receipt_id: str,
	sales_transactions: List[models.MetrcSalesTransaction],
	session: Session) -> None:
	if not sales_transactions:
		return

	company_id = sales_transactions[0].company_id

	prev_sales_transactions = session.query(models.MetrcSalesTransaction).filter(
		models.MetrcSalesTransaction.receipt_id == receipt_id
	).filter(
		models.MetrcSalesTransaction.company_id == company_id
	)

	# Sales transactions data comes in an "all or nothing" fashion, e.g.,
	# we get all the transactions for a receipt ID. So if we pull that data again,
	# we need to flush out what we had before associated with this receipt ID
	for prev_sales_tx in prev_sales_transactions:
		cast(Callable, session.delete)(prev_sales_tx)

	session.flush()

	for sales_tx in sales_transactions:
		session.add(sales_tx)

	package_common_util.update_packages_from_sales_transactions(
		sales_transactions, session)

def _write_sales_receipts_chunk(
	sales_receipt_objs: List[SalesReceiptObj],
	session: Session) -> None:
	receipt_numbers = [receipt_obj.metrc_receipt.receipt_number for receipt_obj in sales_receipt_objs] 

	prev_sales_receipts = session.query(models.MetrcSalesReceipt).filter(
		models.MetrcSalesReceipt.receipt_number.in_(receipt_numbers)
	)

	receipt_number_to_sales_receipt = {}
	for prev_sales_receipt in prev_sales_receipts:
		receipt_number_to_sales_receipt[prev_sales_receipt.receipt_number] = prev_sales_receipt

	for sales_receipt_obj in sales_receipt_objs:
		sales_receipt = sales_receipt_obj.metrc_receipt
		receipt_row_id = None
		if sales_receipt.receipt_number in receipt_number_to_sales_receipt:
			# update
			prev = receipt_number_to_sales_receipt[sales_receipt.receipt_number]
			prev.type = sales_receipt.type
			prev.license_number = sales_receipt.license_number
			prev.company_id = sales_receipt.company_id
			prev.sales_customer_type = sales_receipt.sales_customer_type
			prev.sales_datetime = sales_receipt.sales_datetime
			prev.total_packages = sales_receipt.total_packages
			prev.total_price = sales_receipt.total_price
			prev.payload = sales_receipt.payload
			prev.last_modified_at = sales_receipt.last_modified_at
			receipt_row_id = str(prev.id)
		else:
			# add
			session.add(sales_receipt)
			# In some rare cases, a new sales receipt may show up twice in the same day.
			# The following line prevents an attempt to insert a duplicate.
			receipt_number_to_sales_receipt[sales_receipt.receipt_number] = sales_receipt
			session.flush()
			receipt_row_id = str(sales_receipt.id)

		for tx in sales_receipt_obj.transactions:
			tx.receipt_row_id = cast(Any, receipt_row_id)

		_write_sales_transactions_chunk(
			sales_receipt.receipt_id, sales_receipt_obj.transactions, session)

def write_sales_info(sales_receipts_models: List[SalesReceiptObj], session_maker: Callable, BATCH_SIZE: int = 50) -> None:
	batch_index = 1

	batches_count = len(sales_receipts_models) // BATCH_SIZE + 1
	for sales_chunk in cast(Iterable[List[SalesReceiptObj]], chunker(sales_receipts_models, BATCH_SIZE)):
		logging.info(f'Writing sales receipts batch {batch_index} of {batches_count}...')
		with session_scope(session_maker) as session:
			_write_sales_receipts_chunk(sales_chunk, session)
		batch_index += 1

