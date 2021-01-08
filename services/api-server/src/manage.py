import json
import logging
import os
from typing import Dict

import sentry_sdk
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_script import Manager
from sentry_sdk.integrations.flask import FlaskIntegration

from bespoke.db import models
from server.views import auth
from bespoke.email.email_manager import EmailConfigDict, SESConfigDict
from bespoke.email import email_manager
from server.config import get_config

if os.environ.get('FLASK_ENV') == 'development':
    load_dotenv(os.path.join(os.environ.get('PROJECT_DIR'), '.env'))

sentry_sdk.init(
    dsn=os.environ.get('SENTRY_DSN'),
    integrations=[FlaskIntegration()],
    environment=os.environ.get('FLASK_ENV'),
    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    # We recommend adjusting this value in production,
    traces_sample_rate=1.0
)

logging.basicConfig(format='%(asctime)s [%(levelname)s] - %(message)s',
                    datefmt='%m/%d/%Y %H:%M:%S',
                    level=logging.INFO)

config = get_config()

app = Flask(__name__)
CORS(app)
manager = Manager(app)

app.config.update(config.as_dict())

email_config = EmailConfigDict(
    email_provider=config.EMAIL_PROVIDER,
    from_addr=config.NO_REPLY_EMAIL_ADDRESS,
    ses_config=SESConfigDict(
        use_aws_access_creds=config.USE_AWS_ACCESS_CREDS,
        region_name=config.SES_REGION_NAME,
        ses_access_key_id=config.SES_ACCESS_KEY_ID,
        ses_secret_access_key=config.SES_SECRET_ACCESS_KEY)
    )
#email_client = email_manager.new_client(email_config)
#app.email_client = email_client

app.register_blueprint(auth.handler, url_prefix='/auth')

app.app_config = config
app.engine = models.create_engine()
app.session_maker = models.new_sessionmaker(app.engine)
app.jwt_manager = JWTManager(app)

if __name__ == '__main__':
    manager.run()
