import json

from bespoke.finance.loans import artifacts_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.views.common import auth_util, handler_util

handler = Blueprint('finance_loans_artifacts', __name__)

class ListArtifactsForCreateLoan(MethodView):
	decorators = [auth_util.login_required]
	"""
		This POST request tells you which artifacts can be used to create loans off of,
		and what their remaining balances are.
	"""

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['company_id', 'product_type', 'loan_id']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from list artifacts request'.format(key))

		company_id = form['company_id']
		product_type = form['product_type']
		loan_id = form['loan_id']

		user_session = auth_util.UserSession.from_session()
		if not user_session.is_bank_or_this_company_admin(company_id):
			return handler_util.make_error_response('Access Denied')

		resp, err = artifacts_util.list_artifacts_for_create_loan(
			company_id=company_id,
			product_type=product_type,
			loan_id=loan_id,
			session_maker=current_app.session_maker
		)

		if err:
			return handler_util.make_error_response(err)

		resp['status'] = 'OK'
		return make_response(json.dumps(resp), 200)



handler.add_url_rule(
	'/list_artifacts_for_create_loan', view_func=ListArtifactsForCreateLoan.as_view(
		name='list_artifacts_for_create_loan'))

