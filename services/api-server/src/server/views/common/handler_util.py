import json
import logging
import traceback

from bespoke import errors
from flask import Response, current_app
from typing import Callable, Union, Tuple, Any, cast
from server.views.common.session_util import UserSession

def get_exception_message(e: Exception) -> Tuple[bool, str]:
	return True, '{}'.format(e)

def make_error_response(error: Union[str, errors.Error], status_code: int = None) -> Response:
	if type(error) == errors.Error:
		error_obj = cast(errors.Error, error)
	elif type(error) == str:
		error_obj = errors.Error(msg=cast(str, error))
	else:
		error_obj = errors.Error(msg='Unexpected error message provided')

	if not status_code:
		status_code = 200

	if error_obj.http_code:
		# Set the status code of this HTTP response by giving the errors.Error precedence
		status_code = error_obj.http_code

	user_session = UserSession.from_session()
	cfg = current_app.app_config

	if error_obj.traceback:
		logging.error(error_obj.traceback)

	traceback_str = ''
	show_stack_trace = user_session.is_bank_admin() or cfg.is_not_prod_env()
	if show_stack_trace:
		traceback_str = error_obj.traceback

	return Response(
		response=json.dumps(
		dict(
			status='ERROR', 
			msg=error_obj.msg, 
			err_details=error_obj.details,
			traceback=traceback_str
		)),
		headers={'Content-Type': 'application/json; charset=utf-8'},
		mimetype='application/json',
		status=status_code)

def make_api_error_response(error: Union[str, errors.Error], status_code: int = 500) -> Response:
	return make_error_response(error, status_code)

def catch_bad_json_request(f: Callable[..., Response]) -> Callable[..., Response]:

	def inner_func(*args: Any, **kwargs: Any) -> Response:
		try:
			return f(*args, **kwargs)
		except errors.Error as e:
			e.traceback = traceback.format_exc()
			return make_error_response(e)
		except Exception as e:
			# TODO(dlluncor): Log to sentry
			logging.error(
				u'Received exception in WEBAPP JSON request: {}\n{}'.format(
					e, traceback.format_exc()))

			known, msg = get_exception_message(e)
			if not known:
				msg = u'An unexpected error occurred.'

			err = errors.Error(msg)
			err.traceback = traceback.format_exc()
			return make_error_response(err)

	return inner_func

def catch_bad_api_request(f: Callable[..., Response]) -> Callable[..., Response]:

	def inner_func(*args: Any, **kwargs: Any) -> Response:
		try:
			return f(*args, **kwargs)
		except errors.Error as e:
			e.traceback = traceback.format_exc()
			return make_api_error_response(e, status_code=500)
		except Exception as e:
			# TODO(dlluncor): Log to sentry
			logging.error(
				u'Received exception in WEBAPP JSON request: {}\n{}'.format(
					e, traceback.format_exc()))

			known, msg = get_exception_message(e)
			if not known:
				msg = u'An unexpected error occurred.'

			err = errors.Error(msg)
			err.traceback = traceback.format_exc()
			return make_api_error_response(err, status_code=500)

	return inner_func
