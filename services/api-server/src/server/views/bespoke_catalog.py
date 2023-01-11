import json
import uuid
from typing import Any, cast, List

from bespoke import errors
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.bespoke_catalog import bespoke_catalog_util
from flask import Blueprint, Response, make_response, request, current_app
from flask.views import MethodView
from server.views.common import auth_util, handler_util
from bespoke.helpers.bigquery_helper import BigQueryHelper


handler = Blueprint('bespoke_catalog', __name__)

SKU_CONFIDENCE_INVALID = "Invalid"

SALES_TRANSACTIONS_BY_PRODUCT_NAME_QUERY = """
SELECT
	sales_transactions_grouped.product_name,
	sales_transactions_grouped.product_category_name,
	sales_transactions_grouped.unit_of_measure,
	sales_transactions_grouped.avg_quantity_sold,
	sales_transactions_grouped.avg_price,
	sales_transactions_grouped.product_name_count,
FROM
    ProdMetrcData.metrc_to_bespoke_catalog_skus AS metrc_to_bespoke_sku
RIGHT JOIN
	(SELECT
		sales_transactions.tx_product_name AS product_name,
		sales_transactions.tx_product_category_name AS product_category_name,
		MAX(sales_transactions.tx_unit_of_measure) AS unit_of_measure,
		AVG(sales_transactions.tx_quantity_sold) AS avg_quantity_sold,
		AVG(sales_transactions.tx_total_price/NULLIF(sales_transactions.tx_quantity_sold, 0)) AS avg_price,
		COUNT(sales_transactions.tx_product_name) AS product_name_count
	FROM
		dbt_transformation.int__company_sales_transactions AS sales_transactions
	{% if product_name %}
	WHERE LOWER(sales_transactions.tx_product_name) LIKE LOWER('{{ product_name }}')
	{% endif %}
	GROUP BY
		sales_transactions.tx_product_name,
		sales_transactions.tx_product_category_name
	) AS sales_transactions_grouped
	ON metrc_to_bespoke_sku.product_name = sales_transactions_grouped.product_name
WHERE metrc_to_bespoke_sku.product_name IS NULL
ORDER BY sales_transactions_grouped.product_name_count DESC
LIMIT {{ limit }};
"""

INCOMING_TRANSFER_PACKAGE_BY_PRODUCT_NAME_QUERY = """
SELECT
	transfer_packages_grouped.product_name,
	transfer_packages_grouped.product_category_name,
	transfer_packages_grouped.avg_shipped_quantity,
	transfer_packages_grouped.avg_shipper_wholesale_price,
	transfer_packages_grouped.shipped_unit_of_measure,
	transfer_packages_grouped.avg_item_unit_weight,
	transfer_packages_grouped.item_unit_weight_unit_of_measure_name,
	transfer_packages_grouped.product_name_count,
FROM
    ProdMetrcData.metrc_to_bespoke_catalog_skus AS metrc_to_bespoke_sku
RIGHT JOIN
	(SELECT
		transfer_packages.product_name,
		transfer_packages.product_category_name,
		AVG(transfer_packages.shipped_quantity) AS avg_shipped_quantity,
		AVG(transfer_packages.shipper_wholesale_price/NULLIF(transfer_packages.shipped_quantity, 0)) AS avg_shipper_wholesale_price,
		MAX(transfer_packages.shipped_unit_of_measure) AS shipped_unit_of_measure,
		AVG(transfer_packages.item_unit_weight) AS avg_item_unit_weight,
		MAX(transfer_packages.item_unit_weight_unit_of_measure_name) as item_unit_weight_unit_of_measure_name,
		COUNT(transfer_packages.product_name) AS product_name_count
	FROM
		dbt_transformation.int__company_incoming_transfer_packages AS transfer_packages
	{% if product_name %}
	WHERE LOWER(transfer_packages.product_name) LIKE LOWER('{{ product_name }}')
	{% endif %}
	GROUP BY
		transfer_packages.product_name,
		transfer_packages.product_category_name
	) AS transfer_packages_grouped
	ON metrc_to_bespoke_sku.product_name = transfer_packages_grouped.product_name
WHERE metrc_to_bespoke_sku.product_name IS NULL
ORDER BY
	transfer_packages_grouped.product_name_count DESC
LIMIT {{ limit }};
"""

INVENTORY_PACKAGE_BY_PRODUCT_NAME_QUERY = """
SELECT
	inventory_packages_grouped.product_name,
	inventory_packages_grouped.product_category_name,
	inventory_packages_grouped.unit_of_measure,
	inventory_packages_grouped.product_name_count,
FROM
    ProdMetrcData.metrc_to_bespoke_catalog_skus AS metrc_to_bespoke_sku
RIGHT JOIN
	(SELECT
		inventory_packages.product_name,
		inventory_packages.product_category_name,
		MAX(inventory_packages.unit_of_measure) AS unit_of_measure,
		COUNT(inventory_packages.product_name) AS product_name_count
	FROM
		dbt_transformation.int__company_inventory_packages AS inventory_packages
	{% if product_name %}
	WHERE LOWER(inventory_packages.product_name) LIKE LOWER('{{ product_name }}')
	{% endif %}
	GROUP BY
		inventory_packages.product_name,
		inventory_packages.product_category_name
	) AS inventory_packages_grouped
	ON metrc_to_bespoke_sku.product_name = inventory_packages_grouped.product_name
WHERE metrc_to_bespoke_sku.product_name IS NULL
ORDER BY
	inventory_packages_grouped.product_name_count DESC
LIMIT {{ limit }};
"""


class SalesTransactions(MethodView):
	decorators = [auth_util.bank_admin_or_bank_contractor_required]

	@handler_util.catch_bad_json_request
	def get(self, **kwargs: Any) -> Response:
		params = bespoke_catalog_util.construct_bq_sql_template_params(request.args)
		bqh = BigQueryHelper()
		final_sql = bqh.construct_sql(SALES_TRANSACTIONS_BY_PRODUCT_NAME_QUERY, params)
		results = bqh.execute_sql(final_sql)

		with session_scope(current_app.session_maker) as session:
			metrc_to_bespoke_catalog_skus = cast(
				List[models.MetrcToBespokeCatalogSku],
				session.query(models.MetrcToBespokeCatalogSku.product_name).filter(
					models.MetrcToBespokeCatalogSku.is_deleted == False
				).all())
			cataloged_product_names = set([sku.product_name for sku in metrc_to_bespoke_catalog_skus])

		json_results = []
		for row in results:
			if row.product_name not in cataloged_product_names:
				json_results.append({
					# can't find a unique id in the metrc data json
					'id': str(uuid.uuid4()),
					'product_name': row.product_name,
					'product_category_name': row.product_category_name,
					'quantity_sold': float(row.avg_quantity_sold),
					'total_price': float(row.avg_price),
					'unit_of_measure': row.unit_of_measure,
					'occurrences': row.product_name_count,
				})

		return make_response(json.dumps({
			'status': 'OK',
			'data': json_results
		}), 200)


class IncomingTransferPackages(MethodView):
	decorators = [auth_util.bank_admin_or_bank_contractor_required]

	@handler_util.catch_bad_json_request
	def get(self, **kwargs: Any) -> Response:
		params = bespoke_catalog_util.construct_bq_sql_template_params(request.args)
		bqh = BigQueryHelper()
		final_sql = bqh.construct_sql(INCOMING_TRANSFER_PACKAGE_BY_PRODUCT_NAME_QUERY, params)
		results = bqh.execute_sql(final_sql)

		with session_scope(current_app.session_maker) as session:
			metrc_to_bespoke_catalog_skus = cast(
				List[models.MetrcToBespokeCatalogSku],
				session.query(models.MetrcToBespokeCatalogSku.product_name).filter(
					models.MetrcToBespokeCatalogSku.is_deleted == False
				).all())
			cataloged_product_names = set([sku.product_name for sku in metrc_to_bespoke_catalog_skus])

		json_results = []
		for row in results:
			if row.product_name not in cataloged_product_names:
				json_results.append({
					'id': str(uuid.uuid4()),
					'product_name': row.product_name,
					'product_category_name': row.product_category_name,
					'shipped_quantity': float(row.avg_shipped_quantity),
					'shipper_wholesale_price': float(row.avg_shipper_wholesale_price) if row.avg_shipper_wholesale_price else None,
					'shipped_unit_of_measure': row.shipped_unit_of_measure,
					'occurrences': row.product_name_count,
				})
		
		return make_response(json.dumps({
			'status': 'OK',
			'data': json_results
		}), 200)


class InventoryPackages(MethodView):
	decorators = [auth_util.bank_admin_or_bank_contractor_required]

	@handler_util.catch_bad_json_request
	def get(self, **kwargs: Any) -> Response:
		params = bespoke_catalog_util.construct_bq_sql_template_params(request.args)
		bqh = BigQueryHelper()
		final_sql = bqh.construct_sql(INVENTORY_PACKAGE_BY_PRODUCT_NAME_QUERY, params)
		results = bqh.execute_sql(final_sql)

		with session_scope(current_app.session_maker) as session:
			metrc_to_bespoke_catalog_skus = cast(
				List[models.MetrcToBespokeCatalogSku],
				session.query(models.MetrcToBespokeCatalogSku.product_name).filter(
					models.MetrcToBespokeCatalogSku.is_deleted == False
				).all())
			cataloged_product_names = set([sku.product_name for sku in metrc_to_bespoke_catalog_skus])

		json_results = []
		# TODO: discuss with Spencer if additional columns would be useful
		for row in results:
			if row.product_name not in cataloged_product_names:
				json_results.append({
					'id': str(uuid.uuid4()),
					'product_name': row.product_name,
					'product_category_name': row.product_category_name,
					'unit_of_measure': row.unit_of_measure,
					'occurrences': row.product_name_count,
				})
		
		return make_response(json.dumps({
			'status': 'OK',
			'data': json_results
		}), 200)


class CreateUpdateBespokeCatalogBrandView(MethodView):
	decorators = [auth_util.bank_admin_or_bank_contractor_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')
		
		required_keys = [
			'id',
			'brand_name',
			'parent_company_id'
		]
		for key in required_keys:
			if key not in data:
				raise errors.Error(f'Missing {key} in respond to create brand request')

		id = data["id"]
		brand_name = data["brand_name"]
		parent_company_id = data["parent_company_id"]

		with session_scope(current_app.session_maker) as session:
			brand_id, err = bespoke_catalog_util.create_update_bespoke_catalog_brand(
				session=session,
				id=id,
				brand_name=brand_name,
				parent_company_id=parent_company_id,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f'Successfully saved brand with id: {brand_id}'
		}), 200)


class DeleteBespokeCatalogBrandView(MethodView):
	decorators = [auth_util.bank_admin_or_bank_contractor_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')
		
		if 'id' not in data:
			raise errors.Error(f'Missing id in delete brand request')

		id = data["id"]

		with session_scope(current_app.session_maker) as session:
			brand_id, err = bespoke_catalog_util.delete_bespoke_catalog_brand(
				session=session,
				id=id,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f'Successfully deleted brand with id: {brand_id}'
		}), 200)


class CreateUpdateBespokeCatalogSkuGroupView(MethodView):
	decorators = [auth_util.bank_admin_or_bank_contractor_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')

		required_keys = [
			'id',
			'sku_group_name',
			'brand_id',
			'unit_quantity',
			'unit_of_measure',
		]
		for key in required_keys:
			if key not in data:
				raise errors.Error(f'Missing {key} in respond to create_update_bespoke_catalog_sku_group request')

		id = data["id"]
		sku_group_name = data["sku_group_name"]
		brand_id = data["brand_id"]
		unit_quantity = data["unit_quantity"]
		unit_of_measure = data["unit_of_measure"]

		with session_scope(current_app.session_maker) as session:
			sku_id, err = bespoke_catalog_util.create_update_bespoke_catalog_sku_group(
				session=session,
				id=id,
				sku_group_name=sku_group_name,
				brand_id=brand_id,
				unit_quantity=float(unit_quantity) if unit_quantity else None,
				unit_of_measure=unit_of_measure if unit_of_measure else None,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f'Successfully saved SKU group with id: {sku_id}'
		}), 200)


class DeleteBespokeCatalogSkuGroupView(MethodView):
	decorators = [auth_util.bank_admin_or_bank_contractor_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')

		if 'id' not in data:
			raise errors.Error(f'Missing id in delete sku request')

		id = data["id"]

		with session_scope(current_app.session_maker) as session:
			sku_group_id, err = bespoke_catalog_util.delete_bespoke_catalog_sku_group(
				session=session,
				id=id,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f'Successfully deleted SKU group with id: {sku_group_id}'
		}), 200)


class CreateUpdateBespokeCatalogSkuView(MethodView):
	decorators = [auth_util.bank_admin_or_bank_contractor_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')

		required_keys = [
			'id',
			'sku',
			'sku_group_id',
		]
		for key in required_keys:
			if key not in data:
				raise errors.Error(f'Missing {key} in create_update_bespoke_catalog_sku request')

		id = data["id"]
		sku = data["sku"]
		sku_group_id = data["sku_group_id"]

		with session_scope(current_app.session_maker) as session:
			sku_id, err = bespoke_catalog_util.create_update_bespoke_catalog_sku(
				session=session,
				id=id,
				sku=sku,
				sku_group_id=sku_group_id,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f'Successfully saved SKU with id: {sku_id}'
		}), 200)


class DeleteBespokeCatalogSkuView(MethodView):
	decorators = [auth_util.bank_admin_or_bank_contractor_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')
		
		if 'id' not in data:
			raise errors.Error(f'Missing id in delete sku request')

		id = data["id"]

		with session_scope(current_app.session_maker) as session:
			brand_id, err = bespoke_catalog_util.delete_bespoke_catalog_sku(
				session=session,
				id=id,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f'Successfully deleted sku with id: {brand_id}'
		}), 200)


class CreateMetrcToBespokeCatalogSkuView(MethodView):
	decorators = [auth_util.bank_admin_or_bank_contractor_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')

		required_keys = [
			'id',
			'bespoke_catalog_sku_id',
			'bespoke_catalog_sku',
			'product_name',
			'product_category_name',
			'sku_confidence',
			'wholesale_quantity',
			'is_sample',
		]
		for key in required_keys:
			if key not in data:
				raise errors.Error(f'Missing {key} in /create_metrc_to_bespoke_catalog_sku request')
		
		# MetrcToBespokeCatalogSku
		id = data["id"]
		bespoke_catalog_sku_id = data["bespoke_catalog_sku_id"]
		product_name = data["product_name"]
		product_category_name = data["product_category_name"]
		sku_confidence = data["sku_confidence"]
		wholesale_quantity = data["wholesale_quantity"]
		is_sample = data["is_sample"]

		# BespokeCatalogSku
		bespoke_catalog_sku = data["bespoke_catalog_sku"]
		sku = bespoke_catalog_sku["sku"]
		bespoke_catalog_sku_group_id = bespoke_catalog_sku["bespoke_catalog_sku_group_id"]

		# BespokeCatalogSkuGroup
		bespoke_catalog_sku_group = bespoke_catalog_sku["bespoke_catalog_sku_group"]
		sku_group_name = bespoke_catalog_sku_group["sku_group_name"]
		unit_quantity = bespoke_catalog_sku_group["unit_quantity"]
		unit_of_measure = bespoke_catalog_sku_group["unit_of_measure"]
		bespoke_catalog_brand_id = bespoke_catalog_sku_group["bespoke_catalog_brand_id"]

		# BespokeCatalogBrand
		bespoke_catalog_brand = bespoke_catalog_sku_group["bespoke_catalog_brand"]
		brand_name = bespoke_catalog_brand["brand_name"]
		parent_company_id = bespoke_catalog_brand["parent_company_id"]

		with session_scope(current_app.session_maker) as session:
			if sku_confidence != SKU_CONFIDENCE_INVALID and not is_sample:
				if not bespoke_catalog_sku_id and \
					not bespoke_catalog_sku_group_id and \
					not bespoke_catalog_brand_id:
					bespoke_catalog_brand_id, err = bespoke_catalog_util.create_update_bespoke_catalog_brand(
						session=session,
						id=str(uuid.uuid4()),
						brand_name=brand_name,
						parent_company_id=parent_company_id,
					)
					if err:
						raise err
				
				if not bespoke_catalog_sku_id and \
					not bespoke_catalog_sku_group_id:
					bespoke_catalog_sku_group_id, err = bespoke_catalog_util.create_update_bespoke_catalog_sku_group(
						session=session,
						id=str(uuid.uuid4()),
						sku_group_name=sku_group_name,
						brand_id=bespoke_catalog_brand_id,
						unit_quantity=float(unit_quantity) if unit_quantity else None,
						unit_of_measure=unit_of_measure if unit_of_measure else None,
					)
					if err:
						raise err
					
				if not bespoke_catalog_sku_id:
					bespoke_catalog_sku_id, err = bespoke_catalog_util.create_update_bespoke_catalog_sku(
						session=session,
						id=str(uuid.uuid4()),
						sku=sku,
						sku_group_id=bespoke_catalog_sku_group_id,
					)
					if err:
						raise err
			
			user_session = auth_util.UserSession.from_session()
			metrc_to_sku_id, err = bespoke_catalog_util.create_update_metrc_to_sku(
				session=session,
				id=id,
				bespoke_catalog_sku_id=bespoke_catalog_sku_id,
				product_name=product_name,
				product_category_name=product_category_name,
				sku_confidence=sku_confidence,
				last_edited_by_user_id=user_session.get_user_id(),
				wholesale_quantity=int(wholesale_quantity) if wholesale_quantity else None,
				is_sample=is_sample,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'data': { 'sku_group_id': bespoke_catalog_sku_group_id },
			'msg': f'Successfully saved metrc_to_sku with id: {metrc_to_sku_id}'
		}), 200)


class UpdateMetrcToBespokeCatalogSkuView(MethodView):
	decorators = [auth_util.bank_admin_or_bank_contractor_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')

		required_keys = [
			'id',
			'bespoke_catalog_sku_id',
			'wholesale_quantity',
			'is_sample',
			'sku_confidence',
		]
		for key in required_keys:
			if key not in data:
				raise errors.Error(f'Missing {key} in /update_metrc_to_bespoke_catalog_sku request')
		
		id = data["id"]
		bespoke_catalog_sku_id = data["bespoke_catalog_sku_id"]
		wholesale_quantity = data["wholesale_quantity"]
		is_sample = data["is_sample"]
		sku_confidence = data["sku_confidence"]

		if sku_confidence != SKU_CONFIDENCE_INVALID and not bespoke_catalog_sku_id:
			raise errors.Error(f'Cannot update bespoke_catalog_sku_id to None if sku_confidence is not {SKU_CONFIDENCE_INVALID} for entry with id: {id}')
		
		if sku_confidence == SKU_CONFIDENCE_INVALID and bespoke_catalog_sku_id:
			raise errors.Error(f'Cannot assign bespoke_catalog_sku_id: {bespoke_catalog_sku_id} to entry: {id} if sku_confidence is: {SKU_CONFIDENCE_INVALID}')

		with session_scope(current_app.session_maker) as session:
			user_session = auth_util.UserSession.from_session()
			metrc_to_sku_id, err = bespoke_catalog_util.create_update_metrc_to_sku(
				session=session,
				id=id,
				bespoke_catalog_sku_id=bespoke_catalog_sku_id,
				product_name=None,
				product_category_name=None,
				sku_confidence=sku_confidence,
				last_edited_by_user_id=user_session.get_user_id(),
				wholesale_quantity=int(wholesale_quantity) if wholesale_quantity else None,
				is_sample=is_sample,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f'Successfully updated metrc_to_sku with id: {metrc_to_sku_id}'
		}), 200)


class DeleteMetrcToBespokeCatalogSkuView(MethodView):
	decorators = [auth_util.bank_admin_or_bank_contractor_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')
		
		if 'id' not in data:
			raise errors.Error(f'Missing id in delete metrc to sku request')

		id = data["id"]

		with session_scope(current_app.session_maker) as session:
			brand_id, err = bespoke_catalog_util.delete_metrc_to_bespoke_catalog_sku(
				session=session,
				id=id,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f'Successfully deleted metrc to sku with id: {brand_id}'
		}), 200)


class CreateInvalidMetrcToBespokeCatalogSkusView(MethodView):
	decorators = [auth_util.bank_admin_or_bank_contractor_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')

		with session_scope(current_app.session_maker) as session:
			user_session = auth_util.UserSession.from_session()
			_, err = bespoke_catalog_util.create_invalid_or_sample_metrc_to_sku_multiple(
				session=session,
				data=data,
				is_sample=False,
				last_edited_by_user_id=user_session.get_user_id(),
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f'Successfully marked Bespoke Catalog Entries as invalid'
		}), 200)


class CreateSampleMetrcToBespokeCatalogSkusView(MethodView):
	decorators = [auth_util.bank_admin_or_bank_contractor_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')

		with session_scope(current_app.session_maker) as session:
			user_session = auth_util.UserSession.from_session()
			_, err = bespoke_catalog_util.create_invalid_or_sample_metrc_to_sku_multiple(
				session=session,
				data=data,
				is_sample=True,
				last_edited_by_user_id=user_session.get_user_id(),
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f'Successfully marked Bespoke Catalog Entries as samples'
		}), 200)



handler.add_url_rule(
	'/sales_transactions', view_func=SalesTransactions.as_view(name='sales_transactions_view'))

handler.add_url_rule(
	'/incoming_transfer_packages', view_func=IncomingTransferPackages.as_view(name='incoming_transfer_packages_view'))

handler.add_url_rule(
	'/inventory_packages', view_func=InventoryPackages.as_view(name='inventory_packages_view'))

handler.add_url_rule(
	'/create_update_bespoke_catalog_brand', view_func=CreateUpdateBespokeCatalogBrandView.as_view(name='create_update_bespoke_catalog_brand_view'))

handler.add_url_rule(
	'/delete_bespoke_catalog_brand', view_func=DeleteBespokeCatalogBrandView.as_view(name='delete_bespoke_catalog_brand_view'))

handler.add_url_rule(
	'/create_update_bespoke_catalog_sku_group', view_func=CreateUpdateBespokeCatalogSkuGroupView.as_view(name='create_update_bespoke_catalog_sku_group_view'))

handler.add_url_rule(
	'/delete_bespoke_catalog_sku_group', view_func=DeleteBespokeCatalogSkuGroupView.as_view(name='delete_bespoke_catalog_sku_group_view'))

handler.add_url_rule(
	'/create_update_bespoke_catalog_sku', view_func=CreateUpdateBespokeCatalogSkuView.as_view(name='create_update_bespoke_catalog_sku_view'))

handler.add_url_rule(
	'/delete_bespoke_catalog_sku', view_func=DeleteBespokeCatalogSkuView.as_view(name='delete_bespoke_catalog_sku_view'))

handler.add_url_rule(
	'/create_metrc_to_bespoke_catalog_sku', view_func=CreateMetrcToBespokeCatalogSkuView.as_view(name='create_metrc_to_bespoke_catalog_sku_view'))

handler.add_url_rule(
	'/update_metrc_to_bespoke_catalog_sku', view_func=UpdateMetrcToBespokeCatalogSkuView.as_view(name='update_metrc_to_bespoke_catalog_sku_view'))

handler.add_url_rule(
	'/delete_metrc_to_bespoke_catalog_sku', view_func=DeleteMetrcToBespokeCatalogSkuView.as_view(name='delete_metrc_to_bespoke_catalog_sku_view'))

handler.add_url_rule(
	'/create_invalid_metrc_to_bespoke_catalog_skus', view_func=CreateInvalidMetrcToBespokeCatalogSkusView.as_view(name='create_invalid_metrc_to_bespoke_catalog_skus_view'))

handler.add_url_rule(
	'/create_sample_metrc_to_bespoke_catalog_skus', view_func=CreateSampleMetrcToBespokeCatalogSkusView.as_view(name='create_sample_metrc_to_bespoke_catalog_skus_view'))
