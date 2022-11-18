import logging
import json

from dateutil import parser
from sqlalchemy.orm.session import Session
from sqlalchemy import func
from typing import Any, Callable, List, Iterable, Tuple, Dict, cast

from bespoke import errors
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.metrc.common import metrc_common_util
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

def _get_prev_sales_receipts(receipt_ids: List[str], us_state: str, session: Session) -> List[models.MetrcSalesReceipt]:
	sales_receipts = []

	for receipt_id in receipt_ids:
		sales_receipt = session.query(models.MetrcSalesReceipt).filter(
			models.MetrcSalesReceipt.us_state == us_state
		).filter(
			models.MetrcSalesReceipt.receipt_id == receipt_id
		).first()
		if sales_receipt:
			sales_receipts.append(sales_receipt)

	return sales_receipts

class SalesReceiptObj(object):

	def __init__(self, receipt: models.MetrcSalesReceipt, transactions: List[models.MetrcSalesTransaction]) -> None:
		self.metrc_receipt = receipt
		self.transactions = transactions

def _download_sales_receipt(
	receipt_type: str,
	s: Dict,
	i: int,
	ctx: metrc_common_util.DownloadContext,
) -> SalesReceiptObj:
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
		logging.info('Downloading transactions for sales receipt #{} for company {} on day {}'.format(i, company_id, ctx.cur_date))

	if ctx.get_adjusted_apis_to_use()['sales_transactions']:
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

def get_sales_receipt_models(
	receipt_type: str,
	start_i: int,
	cur_sales_receipts: List[Dict], 
	ctx: metrc_common_util.DownloadContext,
) -> List[SalesReceiptObj]:
	sales_receipt_objs = []

	for i in range(len(cur_sales_receipts)):
		s = cur_sales_receipts[i]
		sales_receipt_obj = _download_sales_receipt(receipt_type, s, start_i + i, ctx)
		sales_receipt_objs.append(sales_receipt_obj)

	return sales_receipt_objs

class SalesReceipts(object):

	def __init__(self, sales_receipts: List[Dict], receipt_type: str) -> None:
		self._sales_receipts = sales_receipts
		self._type = receipt_type

	@property
	def num_receipts(self) -> int:
		return len(self._sales_receipts)

	def get_sales_receipts_dicts(self) -> List[Dict]:
		return self._sales_receipts

	def filter_new_only(self, ctx: metrc_common_util.DownloadContext, session: Session) -> 'SalesReceipts':
		"""
			Only keep sales receipts in which either of the following is true:
			1. Sales receipt is updated: last_modified_at > db.last_modified_at.
			2. Sales receipt is missing transactions.

			This prevents us from querying sales transactions where we know the
			sales receipt hasn't changed.
		"""
		us_state = ctx.license['us_state']
		prev_sales_receipts = []
		receipt_id_to_tx_count = {}

		batch_size = 10
		for sales_receipts_chunk in cast(Iterable[List[Dict]], chunker(self._sales_receipts, batch_size)):
			cur_receipt_ids = ['{}'.format(s['Id']) for s in sales_receipts_chunk]
			prev_sales_receipts_chunk = _get_prev_sales_receipts(cur_receipt_ids, us_state, session)
			prev_sales_receipts += prev_sales_receipts_chunk

			for cur_receipt_id in cur_receipt_ids:
				query = session.query(func.count(models.MetrcSalesTransaction.receipt_id)).filter(
					models.MetrcSalesTransaction.us_state == us_state
				).filter(
					models.MetrcSalesTransaction.receipt_id == cur_receipt_id
				)

				results = query.all()
				for (tx_count, ) in results:
					receipt_id_to_tx_count[cur_receipt_id] = tx_count

		receipt_number_to_sales_receipt = {}
		for prev_sales_receipt in prev_sales_receipts:
			receipt_number_to_sales_receipt[prev_sales_receipt.receipt_number] = prev_sales_receipt

		new_sales_receipts = []
		for s in self._sales_receipts:
			if s['ReceiptNumber'] in receipt_number_to_sales_receipt:
				prev_receipt = receipt_number_to_sales_receipt[s['ReceiptNumber']]
				cur_receipt_id = '{}'.format(s['Id'])
				num_prev_txs = receipt_id_to_tx_count.get(cur_receipt_id, 0)

				if num_prev_txs > 0 and prev_receipt.last_modified_at >= parser.parse(s['LastModified']):
					# If we've seen a previous receipt that's at the same last_modified_at
					# or newer than what we just fetched, no need to use it again
					#
					# Also we need to make sure we have more than 0 transactions associated with the sales receipt
					continue
			
			new_sales_receipts.append(s)

		self._sales_receipts = new_sales_receipts
		return self


def download_sales_info(ctx: metrc_common_util.DownloadContext, session_maker: Callable) -> Tuple[SalesReceipts, SalesReceipts]:
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

	with session_scope(session_maker) as session:
		inactive_sales_receipts = SalesReceipts(inactive_sales_receipts_arr, 'inactive').filter_new_only(ctx, session)

	try:
		resp = rest.get('/sales/v1/receipts/active', time_range=[cur_date_str], split_time_by=SplitTimeBy.HOUR)
		active_sales_receipts_arr = resp.results
		request_status['receipts_api'] = 200
	except errors.Error as e:
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'receipts_api', e)

	with session_scope(session_maker) as session:
		active_sales_receipts = SalesReceipts(active_sales_receipts_arr, 'active').filter_new_only(ctx, session)

	if inactive_sales_receipts:
		logging.info('Downloaded {} new inactive sales receipts ({} original inactive sales receipts) for {} on {}'.format(
			inactive_sales_receipts.num_receipts, len(inactive_sales_receipts_arr), company_details['name'], ctx.cur_date))

	if active_sales_receipts:
		logging.info('Downloaded {} new active sales receipts ({} original active sales receipts) for {} on {}'.format(
			active_sales_receipts.num_receipts, len(active_sales_receipts_arr), company_details['name'], ctx.cur_date))

	if not inactive_sales_receipts and not active_sales_receipts:
		logging.info('No new sales receipts to write for {} on {}'.format(
			company_details['name'], ctx.cur_date
		))
	
	return (inactive_sales_receipts, active_sales_receipts)

def _update_sales_transaction(prev: models.MetrcSalesTransaction, cur: models.MetrcSalesTransaction) -> None:
	prev.type = cur.type
	prev.license_number = cur.license_number
	prev.us_state = cur.us_state
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

	us_state = sales_transactions[0].us_state

	query = session.query(func.count(models.MetrcSalesTransaction.id)).filter(
		models.MetrcSalesTransaction.us_state == us_state
	).filter(
		models.MetrcSalesTransaction.receipt_id == receipt_id
	)
	num_prev_txs = cast(Callable, query.scalar)()
	if num_prev_txs > 0:
		prev_sales_txs = session.query(models.MetrcSalesTransaction).filter(
			models.MetrcSalesTransaction.us_state == us_state
		).filter(
			models.MetrcSalesTransaction.receipt_id == receipt_id
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

	receipt_ids = [receipt_obj.metrc_receipt.receipt_id for receipt_obj in sales_receipt_objs]
	us_state = sales_receipt_objs[0].metrc_receipt.us_state

	prev_sales_receipts = _get_prev_sales_receipts(receipt_ids, us_state, session)

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

def _write_inactive_sales_info(
	session: Session,
	sales_receipts: SalesReceipts,
	ctx: metrc_common_util.DownloadContext,
	batch_size: int,
) -> None:
	# Do inactive sales receipts, while also fetching their transactions
	sales_receipts_dicts = sales_receipts.get_sales_receipts_dicts()
	batches_count = len(sales_receipts_dicts) // batch_size + 1

	i = 0
	batch_index = 1

	for sales_dicts_chunk in cast(Iterable[List[Dict]], chunker(sales_receipts_dicts, batch_size)):
		logging.info(f'Downloading and writing inactive sales receipts batch {batch_index} of {batches_count}...')
		
		sales_receipt_models = get_sales_receipt_models(
			receipt_type='inactive',
			start_i=i,
			cur_sales_receipts=sales_dicts_chunk, 
			ctx=ctx,
		)

		_write_sales_receipts_chunk(sales_receipt_models, session)
		session.commit()

		i += len(sales_receipt_models)
		batch_index += 1

def _write_active_sales_info(
	session: Session,
	sales_receipts: SalesReceipts,
	ctx: metrc_common_util.DownloadContext,
	batch_size: int,
) -> None:
	# Do active sales receipts, while also fetching their transactions
	sales_receipts_dicts = sales_receipts.get_sales_receipts_dicts()
	batches_count = len(sales_receipts_dicts) // batch_size + 1
	
	i = 0
	batch_index = 1

	for sales_dicts_chunk in cast(Iterable[List[Dict]], chunker(sales_receipts_dicts, batch_size)):
		logging.info(f'Downloading and writing active sales receipts batch {batch_index} of {batches_count}...')
		
		sales_receipt_models = get_sales_receipt_models(
			receipt_type='active',
			start_i=i,
			cur_sales_receipts=sales_dicts_chunk, 
			ctx=ctx,
		)

		_write_sales_receipts_chunk(sales_receipt_models, session)
		session.commit()

		i += len(sales_receipt_models)
		batch_index += 1

def write_sales_info(
	sales_receipts_tuple: Tuple[SalesReceipts, SalesReceipts], 
	ctx: metrc_common_util.DownloadContext,
	session_maker: Callable, 
	batch_size: int = 1,
) -> None:
	inactive_sales_receipts, active_sales_receipts = sales_receipts_tuple[0], sales_receipts_tuple[1]
	with session_scope(session_maker) as session:
		_write_inactive_sales_info(session, inactive_sales_receipts, ctx, batch_size)
		_write_active_sales_info(session, active_sales_receipts, ctx, batch_size)

def download_sales_info_with_session(
	session: Session,
	ctx: metrc_common_util.DownloadContext,
) -> Tuple[SalesReceipts, SalesReceipts]:
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

	inactive_sales_receipts = SalesReceipts(inactive_sales_receipts_arr, 'inactive').filter_new_only(ctx, session)

	try:
		resp = rest.get('/sales/v1/receipts/active', time_range=[cur_date_str], split_time_by=SplitTimeBy.HOUR)
		active_sales_receipts_arr = resp.results
		request_status['receipts_api'] = 200
	except errors.Error as e:
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'receipts_api', e)

	active_sales_receipts = SalesReceipts(active_sales_receipts_arr, 'active').filter_new_only(ctx, session)

	if inactive_sales_receipts:
		logging.info('Downloaded {} new inactive sales receipts ({} original inactive sales receipts) for {} on {}'.format(
			inactive_sales_receipts.num_receipts, len(inactive_sales_receipts_arr), company_details['name'], ctx.cur_date))

	if active_sales_receipts:
		logging.info('Downloaded {} new active sales receipts ({} original active sales receipts) for {} on {}'.format(
			active_sales_receipts.num_receipts, len(active_sales_receipts_arr), company_details['name'], ctx.cur_date))

	if not inactive_sales_receipts and not active_sales_receipts:
		logging.info('No new sales receipts to write for {} on {}'.format(
			company_details['name'], ctx.cur_date
		))
	
	return (inactive_sales_receipts, active_sales_receipts)

def write_sales_info_with_session(
	session: Session,
	ctx: metrc_common_util.DownloadContext,
	sales_receipts_tuple: Tuple[SalesReceipts, SalesReceipts], 
	batch_size: int = 1,
) -> None:
	inactive_sales_receipts, active_sales_receipts = sales_receipts_tuple[0], sales_receipts_tuple[1]
	_write_inactive_sales_info(
		session=session,
		sales_receipts=inactive_sales_receipts,
		ctx=ctx,
		batch_size=batch_size,
	)
	_write_active_sales_info(
		session=session,
		sales_receipts=active_sales_receipts,
		ctx=ctx,
		batch_size=batch_size,
	)
