import logging
import os

import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
from dotenv import load_dotenv
from flask import Flask, current_app
from flask_cors import CORS
from flask_script import Manager

from bespoke.db import models
from bespoke.email import email_manager, sendgrid_util
from bespoke.email.email_manager import EmailConfigDict, SendGridConfigDict
from server.config import get_config, is_development_env
from server.views import triggers, healthcheck


if is_development_env(os.environ.get('FLASK_ENV')):
	load_dotenv(os.path.join(os.environ.get('SERVER_ROOT_DIR'), '.env'))


config = get_config()
config.SERVER_TYPE = "async-triggers"


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

# Register the blueprints
app.register_blueprint(triggers.handler, url_prefix='/triggers')
app.register_blueprint(healthcheck.handler, url_prefix='/healthcheck')

app.app_config = config
app.engine = models.create_engine()
app.session_maker = models.new_sessionmaker(app.engine)

email_config = EmailConfigDict(
	email_provider=config.EMAIL_PROVIDER,
	from_addr=config.NO_REPLY_EMAIL_ADDRESS,
	support_email_addr=config.SUPPORT_EMAIL_ADDRESS,
	sendgrid_config=SendGridConfigDict(
		api_key=config.SENDGRID_API_KEY
	),
	flask_env=config.FLASK_ENV,
	no_reply_email_addr=config.NO_REPLY_EMAIL_ADDRESS,
	bank_notify_email_addresses=config.BANK_NOTIFY_EMAIL_ADDRESSES,
	ops_email_addresses=config.OPS_EMAIL_ADDRESSES
)
email_client = email_manager.new_client(email_config)
app.sendgrid_client = sendgrid_util.Client(
	email_client, app.session_maker,
	config.get_security_config())

if __name__ == "__main__":
	manager.run()
