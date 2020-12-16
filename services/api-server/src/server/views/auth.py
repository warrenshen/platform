import json

from flask import Response, Blueprint
from flask import current_app, request, make_response
from flask.views import MethodView

handler = Blueprint('auth', __name__)

class GetJWTView(MethodView):

	def get(self) -> Response:
		return make_response(json.dumps({'hi': 'byte'}), 200)

handler.add_url_rule(
	'/get_jwt_token', view_func=GetJWTView.as_view(name='get_jwt_view'))
