import json
import logging
import traceback

from bespoke import errors
from flask import Response
from typing import Callable, Union, Tuple, Any, cast

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

	return Response(
		response=json.dumps(
		dict(status='ERROR', msg=error_obj.msg, err_details=error_obj.details)),
		headers={'Content-Type': 'application/json; charset=utf-8'},
		mimetype='application/json',
		status=status_code)

def catch_bad_json_request(f: Callable[..., Response]) -> Callable[..., Response]:

	def inner_func(*args: Any, **kwargs: Any) -> Response:
		try:
			return f(*args, **kwargs)
		except errors.Error as e:
			return make_error_response(e)
		except Exception as e:
			# TODO(dlluncor): Log to sentry
			logging.error(
				u'Received exception in WEBAPP JSON request: {}\n{}'.format(
					e, traceback.format_exc()))

			known, msg = get_exception_message(e)
			if not known:
				msg = u'An unexpected error occurred.'

		return make_error_response(errors.Error(msg))

	return inner_func
