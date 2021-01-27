import json

from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask.views import MethodView
from flask_jwt_extended import jwt_required
from typing import cast

from bespoke.db import db_constants, models
from bespoke.db.models import session_scope

handler = Blueprint('finance_loans_purchase_order_loans', __name__)

def make_error_response(msg: str) -> Response:
	return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)	

class HandlePaymentView(MethodView):

	# TODO: add back
	#@jwt_required
	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return make_error_response('No data provided')

		required_keys = ['loan_id']
		for key in required_keys:
			if key not in form:
				return make_error_response(
					'Missing key {} from handle payment request'.format(key))

		purchase_order_loan_id = form['loan_id']

		with session_scope(current_app.session_maker) as session:
			loan = cast(
				models.PurchaseOrderLoan,
				session.query(models.PurchaseOrderLoan).filter_by(
					id=purchase_order_loan_id).first()
			)
			print(loan.purchase_order_id)
			company_id = loan.company_id
			
			# TODO(dlluncor): Lots of validations needed before being able to submit a payment

			payment = models.Payment()
			payment.company_id = company_id
			payment.direction = None 
			payment.amount = None

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

handler.add_url_rule(
	'/handle_payment', view_func=HandlePaymentView.as_view(name='handle_payment_view'))
