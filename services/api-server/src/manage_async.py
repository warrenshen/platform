import logging
import os

import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
from dotenv import load_dotenv
from flask import Flask, current_app
from flask_cors import CORS
from flask_script import Manager

from bespoke.db import models
from bespoke.email import sendgrid_util
from server.config import get_config, get_email_client, is_development_env
from server.views import triggers, healthcheck
from server.views import report_generation


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
app.register_blueprint(report_generation.handler, url_prefix='/reports')

app.app_config = config
# For async server, set SQL statement timeout to 10 seconds.
app.engine = models.create_engine(statement_timeout=10000)
app.session_maker = models.new_sessionmaker(app.engine)

email_client = get_email_client(config)
app.sendgrid_client = sendgrid_util.Client(
	email_client, app.session_maker,
	config.get_security_config())

if __name__ == "__main__":
	manager.run()
