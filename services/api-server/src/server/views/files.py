import json
import logging
import os
from datetime import datetime
from io import BytesIO
from typing import Any, Callable, List, Tuple, cast

import boto3
import requests
from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import FileTypeEnum
from bespoke.db.models import session_scope
from bespoke.files import files_util
from botocore.exceptions import ClientError
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import auth_util, handler_util
from server.views.common.auth_util import UserPayloadDict, UserSession
from sqlalchemy.orm.session import Session

handler = Blueprint('files', __name__)

class PutSignedUrlView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		# once we have event logging systems in place, we should
		# log which user is moving files, and which file
		# which implies possibly pulling some info back out of the shared function

		url, file_in_db_dict, upload_via_server, err = files_util.put_signed_url()
		if err:
			raise err

		return make_response(json.dumps({
	        'status': 'OK',
	        'url': url,
	        'file_in_db': file_in_db_dict,
	        'upload_via_server': upload_via_server
	    }), 200)


class AnonymousPutSignedUrlView(MethodView):

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		# once we have event logging systems in place, we should
		# log which user is moving files, and which file
		# which implies possibly pulling some info back out of the shared function

		url, file_in_db_dict, upload_via_server, err = files_util.put_signed_url()
		if err:
			raise err

		return make_response(json.dumps({
	        'status': 'OK',
	        'url': url,
	        'file_in_db': file_in_db_dict,
	        'upload_via_server': upload_via_server
	    }), 200)


class DownloadSignedUrlView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		# once we have event logging systems in place, we should
		# log which user is moving files, and which file
		# which implies possibly pulling some info back out of the shared function

		files_data, err = files_util.download_signed_url(is_anonymous = False)
		if err:
			raise err

		return make_response(json.dumps({'status': 'OK', 'files': files_data}), 200)

class AnonymousDownloadSignedUrlView(MethodView):

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		# once we have event logging systems in place, we should
		# log which user is moving files, and which file
		# which implies possibly pulling some info back out of the shared function

		files_data, err = files_util.download_signed_url(is_anonymous = True)
		if err:
			raise err

		return make_response(json.dumps({'status': 'OK', 'files': files_data}), 200)

class UploadSignedUrlView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def put(self) -> Response:
		# once we have event logging systems in place, we should
		# log which user is moving files, and which file
		# which implies possibly pulling some info back out of the shared function

		is_successful, err = files_util.upload_signed_url()
		if err:
			raise err

		return make_response(json.dumps({'status': 'OK'}), 200)


class AnonymousUploadSignedUrlView(MethodView):

	@handler_util.catch_bad_json_request
	def put(self) -> Response:
		# once we have event logging systems in place, we should
		# log which user is moving files, and which file
		# which implies possibly pulling some info back out of the shared function
		
		is_successful, err = files_util.upload_signed_url()
		if err:
			raise err

		return make_response(json.dumps({'status': 'OK'}), 200)


handler.add_url_rule(
	'/download_signed_url', view_func=DownloadSignedUrlView.as_view(name='download_signed_url_view'))

handler.add_url_rule(
	'/anonymous_download_signed_url', view_func=AnonymousDownloadSignedUrlView.as_view(name='anonymous_download_signed_url_view'))

handler.add_url_rule(
	'/put_signed_url', view_func=PutSignedUrlView.as_view(name='put_signed_url_view'))

handler.add_url_rule(
	'/anonymous_put_signed_url', view_func=AnonymousPutSignedUrlView.as_view(name='anonymous_put_signed_url_view'))

handler.add_url_rule(
	'/upload_signed_url', view_func=UploadSignedUrlView.as_view(name='upload_signed_url_view'))

handler.add_url_rule(
	'/anonymous_upload_signed_url', view_func=AnonymousUploadSignedUrlView.as_view(name='anonymous_upload_signed_url_view'))
