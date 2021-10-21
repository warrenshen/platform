import logging
import concurrent
import datetime
import json
import requests

from concurrent.futures import ThreadPoolExecutor
from dateutil import parser
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from sqlalchemy import func
from typing import Any, Callable, List, Iterable, Tuple, Dict, cast

from bespoke import errors
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.metrc.common import metrc_common_util, package_common_util
from bespoke.metrc.common.metrc_common_util import chunker, SplitTimeBy


class SalesTransactions(object):

	def __init__(self, sales_transactions: List[Dict], transaction_type: str) -> None:
		self._sales_transactions = sales_transactions
		self._type = transaction_type

	def get_sales_transactions_models(self, ctx: metrc_common_util.DownloadContext, receipt_id: str) -> List[models.MetrcSalesTransaction]:
		sales_transactions = []
		for i in range(len(self._sales_transactions)):
			tx = self._sales_transactions[i]
			sales_tx = models.MetrcSalesTransaction()
			sales_tx.type = self._type
			sales_tx.license_number = ctx.license['license_number']
			sales_tx.us_state = ctx.license['us_state']
			sales_tx.company_id = cast(Any, ctx.company_details['company_id'])
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

def _get_prev_sales_receipts(receipt_numbers: List[str], us_state: str, session: Session) -> List[models.MetrcSalesReceipt]:
	return session.query(models.MetrcSalesReceipt).filter(
		models.MetrcSalesReceipt.us_state == us_state
	).filter(
		models.MetrcSalesReceipt.receipt_number.in_(receipt_numbers)
	).all()

class SalesReceiptObj(object):

	def __init__(self, receipt: models.MetrcSalesReceipt, transactions: List[models.MetrcSalesTransaction]) -> None:
		self.metrc_receipt = receipt
		self.transactions = transactions

def _download_sales_receipt(
	receipt_type: str, s: Dict, i: int, ctx: metrc_common_util.DownloadContext) -> SalesReceiptObj:
	license_number = ctx.license['license_number']
	company_id = ctx.company_details['company_id']
	LOG_EVERY = 10
		
	receipt = models.MetrcSalesReceipt()
	receipt.type = receipt_type
	receipt.license_number = license_number
	receipt.us_state = ctx.license['us_state']
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
		logging.info('Downloading sales transaction #{} for company {} on day {}'.format(i, company_id, ctx.cur_date))

	if ctx.apis_to_use['sales_transactions']:
		resp = ctx.rest.get('/sales/v1/receipts/{}'.format(receipt.receipt_id))
		receipt_resp = json.loads(resp.content)
		transactions = SalesTransactions(receipt_resp['Transactions'], receipt_type).get_sales_transactions_models(
			ctx=ctx,
			receipt_id=receipt.receipt_id
		)
		ctx.request_status['sales_transactions_api'] = 200
	else:
		transactions = []

	return SalesReceiptObj(
		receipt=receipt,
		transactions=transactions
	)

class SalesReceipts(object):

	def __init__(self, sales_receipts: List[Dict], receipt_type: str) -> None:
		self._sales_receipts = sales_receipts
		self._type = receipt_type

	def filter_new_only(self, ctx: metrc_common_util.DownloadContext, session: Session) -> 'SalesReceipts':
		"""
			Only keep sales receipts which are newly updated, e.g.,
			last_modified_at > db.last_modified_at.

			This prevents us from querying sales transactions where we know the
			sales receipt hasn't changed.
		"""
		if ctx.worker_cfg.force_fetch_missing_sales_transactions:
			# If we want to force fetch transactions for all sales receipts,
			# then there is no need to run any filtering logic, and we essentially
			# process all sales receipts anew
			return self

		us_state = ctx.license['us_state']
		receipt_numbers = [s['ReceiptNumber'] for s in self._sales_receipts]
		prev_sales_receipts = []

		BATCH_SIZE = 50
		for receipt_numbers_chunk in cast(Iterable[List[str]], chunker(receipt_numbers, BATCH_SIZE)):
			prev_sales_receipts_chunk = _get_prev_sales_receipts(receipt_numbers_chunk, us_state, session)
			prev_sales_receipts += prev_sales_receipts_chunk

		receipt_number_to_sales_receipt = {}
		for prev_sales_receipt in prev_sales_receipts:
			receipt_number_to_sales_receipt[prev_sales_receipt.receipt_number] = prev_sales_receipt

		new_sales_receipts = []
		for s in self._sales_receipts:
			if s['ReceiptNumber'] in receipt_number_to_sales_receipt:
				prev_receipt = receipt_number_to_sales_receipt[s['ReceiptNumber']]
				if prev_receipt.last_modified_at >= parser.parse(s['LastModified']):
					# If we've seen a previous receipt that's at the same last_modified_at
					# or newer than what we just fetched, no need to use it again
					continue
			
			new_sales_receipts.append(s)

		self._sales_receipts = new_sales_receipts
		return self

	def get_sales_receipt_models(self, ctx: metrc_common_util.DownloadContext, company_id: str, cur_date: datetime.date) -> List[SalesReceiptObj]:
		sales_receipt_objs = []

		with ThreadPoolExecutor(max_workers=ctx.worker_cfg.num_parallel_sales_transactions) as executor:
			future_to_i = {}

			for i in range(len(self._sales_receipts)):
				s = self._sales_receipts[i]
				future_to_i[executor.submit(_download_sales_receipt, self._type, s, i, ctx)] = i
				
			for future in concurrent.futures.as_completed(future_to_i):
				sales_receipt_obj = future.result()
				sales_receipt_objs.append(sales_receipt_obj)

		return sales_receipt_objs

def download_sales_info(ctx: metrc_common_util.DownloadContext, session_maker: Callable) -> List[SalesReceiptObj]:
	# NOTE: Sometimes there are a lot of inactive receipts to pull for a single day
	# and this makes it look like the sync is stuck / hanging - could be good to
	# change this logic to use smaller (intraday) time ranges to prevent this.
	active_sales_receipts_arr: List[Dict] = []
	inactive_sales_receipts_arr: List[Dict] = []

	company_details = ctx.company_details
	cur_date_str = ctx.get_cur_date_str()
	request_status = ctx.request_status
	rest = ctx.rest

	try:
		resp = rest.get('/sales/v1/receipts/inactive', time_range=[cur_date_str], split_time_by=SplitTimeBy.HOUR)
		inactive_sales_receipts_arr = resp.results
		request_status['receipts_api'] = 200
	except errors.Error as e:
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'receipts_api', e)

	try:
		resp = rest.get('/sales/v1/receipts/active', time_range=[cur_date_str], split_time_by=SplitTimeBy.HOUR)
		active_sales_receipts_arr = resp.results
		request_status['receipts_api'] = 200
	except errors.Error as e:
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'receipts_api', e)

	with session_scope(session_maker) as session:
		active_sales_receipts = SalesReceipts(active_sales_receipts_arr, 'active').filter_new_only(ctx, session)

	active_sales_receipts_models = active_sales_receipts.get_sales_receipt_models(
		ctx=ctx,
		company_id=company_details['company_id'],
		cur_date=ctx.cur_date
	)

	with session_scope(session_maker) as session:
		inactive_sales_receipts = SalesReceipts(inactive_sales_receipts_arr, 'inactive').filter_new_only(ctx, session)

	inactive_sales_receipts_models = inactive_sales_receipts.get_sales_receipt_models(
		ctx=ctx,
		company_id=company_details['company_id'],
		cur_date=ctx.cur_date
	)

	num_transactions = sum([len(sales_receipt_model.transactions) for sales_receipt_model in active_sales_receipts_models])

	if active_sales_receipts_models:
		logging.info('Downloaded {} new active sales receipts with {} transactions for {} on {}'.format(
			len(active_sales_receipts_models), num_transactions, company_details['name'], ctx.cur_date))
	
	if inactive_sales_receipts_models:
		logging.info('Downloaded {} inactive sales receipts for {} on {}'.format(
			len(inactive_sales_receipts_models), company_details['name'], ctx.cur_date))

	sales_receipts_models = active_sales_receipts_models + inactive_sales_receipts_models
	return sales_receipts_models

def _update_sales_transaction(prev: models.MetrcSalesTransaction, cur: models.MetrcSalesTransaction) -> None:
	prev.type = cur.type
	prev.license_number = cur.license_number
	prev.us_state = cur.us_state
	prev.company_id = cur.company_id
	prev.receipt_id = cur.receipt_id
	prev.receipt_row_id = cur.receipt_row_id
	prev.package_id = cur.package_id
	prev.package_label = cur.package_label
	prev.product_name = cur.product_name
	prev.product_category_name = cur.product_category_name
	prev.quantity_sold = cur.quantity_sold
	prev.unit_of_measure = cur.unit_of_measure
	prev.total_price = cur.total_price
	prev.recorded_datetime = cur.recorded_datetime
	prev.payload = cur.payload
	prev.last_modified_at = cur.last_modified_at	

def _write_sales_transactions_chunk(
	receipt_id: str,
	sales_transactions: List[models.MetrcSalesTransaction],
	session: Session) -> None:
	if not sales_transactions:
		return

	company_id = sales_transactions[0].company_id
	us_state = sales_transactions[0].us_state

	query = session.query(func.count(models.MetrcSalesTransaction.id)).filter(
		models.MetrcSalesTransaction.us_state == us_state
	).filter(
		models.MetrcSalesTransaction.receipt_id == receipt_id
	).filter(
		models.MetrcSalesTransaction.company_id == company_id
	)
	num_prev_txs = cast(Callable, query.scalar)()
	if num_prev_txs > 0:
		prev_sales_txs = session.query(models.MetrcSalesTransaction).filter(
			models.MetrcSalesTransaction.us_state == us_state
		).filter(
			models.MetrcSalesTransaction.receipt_id == receipt_id
		).filter(
			models.MetrcSalesTransaction.company_id == company_id
		).all()
		package_id_to_prev_tx = {}
		prev_txs_to_delete = {}
		for prev_sales_tx in prev_sales_txs:
			package_id_to_prev_tx[prev_sales_tx.package_id] = prev_sales_tx
			prev_txs_to_delete[prev_sales_tx.package_id] = prev_sales_tx
			

		for sales_tx in sales_transactions:
			if sales_tx.package_id in package_id_to_prev_tx:
				prev_tx = package_id_to_prev_tx[sales_tx.package_id]
				_update_sales_transaction(prev=prev_tx, cur=sales_tx)
				prev_tx.is_deleted = False # In case it flipped from is_deleted True to False

				if sales_tx.package_id in prev_txs_to_delete:
					# If we see the same package_id from the previous set of transactions
					# we don't have to delete it. But if we never find it
					# we have to delete those transactions.
					del prev_txs_to_delete[sales_tx.package_id]
			else:
				session.add(sales_tx)

		for prev_tx_to_delete in prev_txs_to_delete.values():
			prev_tx_to_delete.is_deleted = True

		return

	# If there are no previous transactions then do a bulk insert of all these
	# sales transactions

	# Sales transactions data comes in an "all or nothing" fashion, e.g.,
	# we get all the transactions for a receipt ID. So if we pull that data again,
	# we need to flush out what we had before associated with this receipt ID
	sales_transaction_dicts = []
	for sales_tx in sales_transactions:
		sales_transaction_dicts.append({
			'type': sales_tx.type,
			'license_number': sales_tx.license_number,
			'us_state': sales_tx.us_state,
			'company_id': sales_tx.company_id,
			'receipt_id': sales_tx.receipt_id,
			'receipt_row_id': sales_tx.receipt_row_id,
			'package_id': sales_tx.package_id,
			'package_label': sales_tx.package_label,
			'product_name': sales_tx.product_name,
			'product_category_name': sales_tx.product_category_name,
			'quantity_sold': sales_tx.quantity_sold,
			'unit_of_measure': sales_tx.unit_of_measure,
			'total_price': sales_tx.total_price,
			'recorded_datetime': sales_tx.recorded_datetime,
			'payload': sales_tx.payload,
			'last_modified_at': sales_tx.last_modified_at	
		})

	session.execute(models.MetrcSalesTransaction.__table__.insert(), sales_transaction_dicts)

	# package_common_util.update_packages_from_sales_transactions(
	# 	sales_transactions, session)

def _write_sales_receipts_chunk(
	sales_receipt_objs: List[SalesReceiptObj],
	session: Session) -> None:
	if not sales_receipt_objs:
		return

	receipt_numbers = [receipt_obj.metrc_receipt.receipt_number for receipt_obj in sales_receipt_objs] 
	us_state = sales_receipt_objs[0].metrc_receipt.us_state

	prev_sales_receipts = _get_prev_sales_receipts(receipt_numbers, us_state, session)

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
			prev.us_state = sales_receipt.us_state
			prev.us_state = sales_receipt.us_state
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

