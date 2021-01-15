import boto3
import json
import logging
import requests

from botocore.exceptions import ClientError
from datetime import datetime
from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask.views import MethodView
from flask_jwt_extended import jwt_required
from io import BytesIO
from typing import cast

from server.config import Config

handler = Blueprint('files', __name__)

def make_error_response(msg: str) -> Response:
	return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)	

class PutSignedUrlView(MethodView):

	@jwt_required
	def post(self) -> Response:
		s3_client = boto3.client('s3')
		cfg = cast(Config, current_app.app_config)
		bucket_name = cfg.S3_BUCKET_NAME

		form = json.loads(request.data)
		if not form:
			return make_error_response('No form provided in get the signed url')


		required_keys = ['name', 'content_type', 'company_id', 'doc_type']
		for key in required_keys:
			if key not in form:
				return make_error_response(f'Missing {key} in signed url request')

		company_id = form['company_id']
		now_str = datetime.now().strftime('%Y%m%d-%H%M%S-%f')
		path = f"files/customers/{company_id}/{form['doc_type']}/{now_str}/{form['name']}"
		content_type = form['content_type']

		try:
			url = s3_client.generate_presigned_url(
				'put_object', 
				Params={
					'Bucket': bucket_name, 
					'Key': path,
					'ContentType': content_type
				}, 
				ExpiresIn=600,
			)
		except ClientError as e:
			logging.error('Exception generating presigned_url: {}'.format(e))
			return make_error_response('Failed to create upload url')

		upload_via_server = False
		if cfg.is_development_env():
			upload_via_server = True

		return make_response(json.dumps({
			'status': 'OK',
			'url': url,
			'path': path,
			'upload_via_server': upload_via_server
		}), 200)

class UploadSignedUrlView(MethodView):

	@jwt_required
	def put(self) -> Response:
		s3_client = boto3.client('s3')
		cfg = cast(Config, current_app.app_config)
		bucket_name = cfg.S3_BUCKET_NAME

		presigned_url = request.headers['Url']
		content_type = request.headers['Content-Type']
		s3_key_path = request.headers['FilePath']

		s3_client.upload_fileobj(BytesIO(request.data), bucket_name, s3_key_path)
		return make_response(json.dumps({'status': 'OK'}), 200)

handler.add_url_rule(
	'/put_signed_url', view_func=PutSignedUrlView.as_view(name='put_signed_url_view'))

handler.add_url_rule(
	'/upload_signed_url', view_func=UploadSignedUrlView.as_view(name='upload_signed_url_view'))
