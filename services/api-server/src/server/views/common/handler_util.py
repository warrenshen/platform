import json
import logging
import traceback

from bespoke import errors
from flask import Response
from typing import Callable, Tuple, Any

def get_exception_message(e: Exception) -> Tuple[bool, str]:
    return True, '{}'.format(e)

def bad_json_response(error: errors.Error) -> Response:
  return Response(
      response=json.dumps(
        dict(status='ERROR', msg=error.msg, err_details=error.details)),
      headers={'Content-Type': 'application/json; charset=utf-8'},
      mimetype='application/json')

def catch_bad_json_request(f: Callable[..., Response]) -> Callable[..., Response]:

  def inner_func(*args: Any, **kwargs: Any) -> Response:
    try:
        return f(*args, **kwargs)
    except Exception as e:
        # TODO(dlluncor): Log to sentry
      logging.error(
          u'Received exception in WEBAPP JSON request: {}\n{}'.format(
              e, traceback.format_exc()))

      known, msg = get_exception_message(e)
      if not known:
        msg = u'An unexpected error occurred.'

    return bad_json_response(errors.Error(msg))

  return inner_func
