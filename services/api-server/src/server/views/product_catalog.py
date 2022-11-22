import json
import uuid
from typing import Any, cast

from bespoke import errors
from bespoke.db.models import session_scope
from bespoke.product_catalog import product_catalog_util
from flask import Blueprint, Response, make_response, request, current_app
from flask.views import MethodView
from server.config import Config
from server.views.common import auth_util, handler_util


handler = Blueprint('bespoke_catalog', __name__)

# TODO: setup for https://www.notion.so/bespokefinancial/Set-up-api-server-to-query-Google-BQ-3c2d68dbb7444f8187522bb13e00b0b2
# from google.cloud import bigquery
# class ViewMetrcDataView(MethodView):
# 	decorators = [auth_util.bank_admin_required]

# 	@handler_util.catch_bad_json_request
# 	def get(self, **kwargs: Any) -> Response:
# 		client = bigquery.Client()
# 		query_job = client.query(
# 			"select * from dbt_transformation.int__company_incoming_transfer_packages limit 10"
# 		)
# 		results = query_job.result()
# 		json_results = []
# 		for row in results:
# 			json_results.append({
# 				'id': row.pk,
# 				'product_name': row.product_name,
# 				'product_category_name': row.product_category_name,
# 			})
		
# 		return make_response(json.dumps({
# 			'status': 'OK',
# 			'data': json_results
# 		}), 200)


class CreateUpdateBespokeCatalogBrandView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')
		
		required_keys = [
			'id',
			'brand_name',
		]
		for key in required_keys:
			if key not in data:
				raise errors.Error(f'Missing {key} in respond to create brand request')

		id = data["id"]
		brand_name = data["brand_name"]
		us_state = data.get("us_state")

		with session_scope(current_app.session_maker) as session:
			brand_id, err = product_catalog_util.create_update_bespoke_catalog_brand(
				session=session,
				id=id,
				brand_name=brand_name,
				us_state=us_state
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f'Successfully saved brand with id: {brand_id}'
		}), 200)


class DeleteBespokeCatalogBrandView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')
		
		if 'id' not in data:
			raise errors.Error(f'Missing id in delete brand request')

		id = data["id"]

		with session_scope(current_app.session_maker) as session:
			brand_id, err = product_catalog_util.delete_bespoke_catalog_brand(
				session=session,
				id=id,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f'Successfully deleted brand with id: {brand_id}'
		}), 200)


class CreateUpdateBespokeCatalogSkuView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')

		required_keys = [
			'id',
			'sku',
			'brand_id',
			'brand_name',
		]
		for key in required_keys:
			if key not in data:
				raise errors.Error(f'Missing {key} in respond to approval request')

		id = data["id"]
		sku = data["sku"]
		brand_id = data["brand_id"]
		brand_name = data["brand_name"]

		with session_scope(current_app.session_maker) as session:
			if not brand_id:
				brand_id, err = product_catalog_util.create_update_bespoke_catalog_brand(
					session=session,
					id=str(uuid.uuid4()),
					brand_name=brand_name,
					us_state=None
				)
				if err:
					raise err
			
			sku_id, err = product_catalog_util.create_update_bespoke_catalog_sku(
				session=session,
				id=id,
				sku=sku,
				brand_id=brand_id,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f'Successfully saved sku with id: {sku_id}'
		}), 200)


class DeleteBespokeCatalogSkuView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')
		
		if 'id' not in data:
			raise errors.Error(f'Missing id in delete sku request')

		id = data["id"]

		with session_scope(current_app.session_maker) as session:
			brand_id, err = product_catalog_util.delete_bespoke_catalog_sku(
				session=session,
				id=id,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f'Successfully deleted brand with id: {brand_id}'
		}), 200)


# handler.add_url_rule(
# 	'/view_metrc_data', view_func=ViewMetrcDataView.as_view(name='view_api_key_view'))

handler.add_url_rule(
	'/create_update_bespoke_catalog_brand', view_func=CreateUpdateBespokeCatalogBrandView.as_view(name='create_update_bespoke_catalog_brand_view'))

handler.add_url_rule(
	'/delete_bespoke_catalog_brand', view_func=DeleteBespokeCatalogBrandView.as_view(name='delete_bespoke_catalog_brand_view'))

handler.add_url_rule(
	'/create_update_bespoke_catalog_sku', view_func=CreateUpdateBespokeCatalogSkuView.as_view(name='create_update_bespoke_catalog_sku_view'))

handler.add_url_rule(
	'/delete_bespoke_catalog_sku', view_func=DeleteBespokeCatalogSkuView.as_view(name='delete_bespoke_catalog_sku_view'))
