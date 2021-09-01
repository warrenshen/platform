import json
import logging
import os
from typing import Dict

import sentry_sdk
from dotenv import load_dotenv
from flask import Flask, current_app
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_script import Manager
from sentry_sdk.integrations.flask import FlaskIntegration

from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.security import two_factor_util
from server.config import get_config, get_email_client, is_development_env, is_test_env
from server.views import (
	auth,
	companies,
	contracts,
	cypress,
	files,
    healthcheck,
    inventory,
	licenses,
	metrc,
	notify,
	partnerships,
    purchase_orders,
	two_factor,
	users,
)
from server.views.finance import credits, fees, liens
from server.views.finance.ebba_applications import \
    approvals as ebba_application_approvals
from server.views.finance.invoices import routes as invoices_routes
from server.views.finance.loans import (adjustments, advances, approvals,
                                        artifacts, deletion)
from server.views.finance.loans import purchase_orders as loans_purchase_orders
from server.views.finance.loans import repayments, reports

if is_test_env(os.environ.get('FLASK_ENV')):
	load_dotenv(os.path.join(os.environ.get('SERVER_ROOT_DIR'), '.env.test'))
elif is_development_env(os.environ.get('FLASK_ENV')):
	load_dotenv(os.path.join(os.environ.get('SERVER_ROOT_DIR'), '.env'))

config = get_config()

if not is_test_env(os.environ.get('FLASK_ENV')):
	sentry_sdk.init(
		dsn=config.SENTRY_DSN,
		integrations=[FlaskIntegration()],
		environment=config.FLASK_ENV,
		# Set traces_sample_rate to 1.0 to capture 100%
		# of transactions for performance monitoring.
		# We recommend adjusting this value in production,
		traces_sample_rate=1.0
	)

logging.basicConfig(format='%(asctime)s [%(levelname)s] - %(message)s',
					datefmt='%m/%d/%Y %H:%M:%S',
					level=logging.INFO)

app = Flask(__name__)

CORS(app)
manager = Manager(app)

app.config.update(config.as_dict())

if is_test_env(os.environ.get('FLASK_ENV')) or is_development_env(os.environ.get('FLASK_ENV')):
	app.register_blueprint(cypress.handler, url_prefix='/cypress')

app.register_blueprint(auth.handler, url_prefix='/auth')
app.register_blueprint(companies.handler, url_prefix='/companies')
app.register_blueprint(contracts.handler, url_prefix='/contracts')
app.register_blueprint(files.handler, url_prefix='/files')
app.register_blueprint(licenses.handler, url_prefix='/licenses')
app.register_blueprint(two_factor.handler, url_prefix='/two_factor')
app.register_blueprint(users.handler, url_prefix='/users')

# Third-party APIs
app.register_blueprint(inventory.handler, url_prefix='/inventory')
app.register_blueprint(metrc.handler, url_prefix='/metrc')
app.register_blueprint(liens.handler, url_prefix='/liens')
# Partnerships
app.register_blueprint(partnerships.handler, url_prefix='/partnerships')

# Purchase orders
app.register_blueprint(purchase_orders.handler, url_prefix='/purchase_orders')

# Invoices
app.register_blueprint(invoices_routes.handler, url_prefix='/invoices')

# Notifications
app.register_blueprint(notify.handler, url_prefix='/notify')

# Finance
app.register_blueprint(ebba_application_approvals.handler, url_prefix='/finance/ebba_applications/approvals')
app.register_blueprint(credits.handler, url_prefix='/finance/credits')
app.register_blueprint(fees.handler, url_prefix='/finance/fees')
app.register_blueprint(repayments.handler, url_prefix='/finance/loans/repayments')
app.register_blueprint(artifacts.handler, url_prefix='/finance/loans/artifacts')
app.register_blueprint(advances.handler, url_prefix='/finance/loans/advances')
app.register_blueprint(approvals.handler, url_prefix='/finance/loans/approvals')
app.register_blueprint(adjustments.handler, url_prefix='/finance/loans/adjustments')
app.register_blueprint(deletion.handler, url_prefix='/finance/loans/deletion')
app.register_blueprint(reports.handler, url_prefix='/finance/loans/reports')
app.register_blueprint(loans_purchase_orders.handler, url_prefix='/finance/loans/purchase_orders')

# healthcheck
app.register_blueprint(healthcheck.handler, url_prefix='/healthcheck')

app.app_config = config
app.engine = models.create_engine()
app.session_maker = models.new_sessionmaker(app.engine)
app.jwt_manager = JWTManager(app)

email_client = get_email_client(config)
app.sendgrid_client = sendgrid_util.Client(
	email_client, app.session_maker,
	config.get_security_config())

if not config.IS_TEST_ENV:
	app.sms_client = two_factor_util.SMSClient(
		account_sid=config.TWILIO_ACCOUNT_SID,
		auth_token=config.TWILIO_AUTH_TOKEN,
		from_=config.TWILIO_FROM_NUMBER
	)


@app.jwt_manager.token_in_blacklist_loader
def check_if_token_in_blacklist(decrypted_token: Dict) -> bool:
	jti = decrypted_token['jti']
	with session_scope(current_app.session_maker) as session:
		existing_revoked_token = session.query(models.RevokedTokenModel).filter(
			models.RevokedTokenModel.jti == jti).first()
		if existing_revoked_token:
			return True
		else:
			return False
	return False


if __name__ == '__main__':
	manager.run()
