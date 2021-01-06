import json

from flask import request, make_response
from flask import Response, Blueprint
from flask.views import MethodView

handler = Blueprint('purchase_order', __name__)

def make_error_response(msg: str) -> Response:
	return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)	

class ModifiedView(MethodView):

	def post(self) -> Response:
		data = json.loads(request.data)
		if not data:
			return make_error_response('No data provided')

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

handler.add_url_rule(
	'/modified', view_func=ModifiedView.as_view(name='modified_view'))
