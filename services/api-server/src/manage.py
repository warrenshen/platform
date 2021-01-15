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
from bespoke.email.email_manager import EmailConfigDict, SendGridConfigDict
from bespoke.email import email_manager

from server.config import get_config, is_development_env
from server.views import auth
from server.views import notify
from server.views import files
from server.views import two_factor

if is_development_env(os.environ.get('FLASK_ENV')):
    load_dotenv(os.path.join(os.environ.get('SERVER_ROOT_DIR'), '.env'))

config = get_config()

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

email_config = EmailConfigDict(
    email_provider=config.EMAIL_PROVIDER,
    from_addr=config.NO_REPLY_EMAIL_ADDRESS,
    sendgrid_config=SendGridConfigDict(
        api_key=config.SENDGRID_API_KEY
    )
)
email_client = email_manager.new_client(email_config)
app.email_client = email_client

app.register_blueprint(two_factor.handler, url_prefix='/two_factor')
app.register_blueprint(notify.handler, url_prefix='/notify')
app.register_blueprint(files.handler, url_prefix='/files')
app.register_blueprint(auth.handler, url_prefix='/auth')

app.app_config = config
app.engine = models.create_engine()
app.session_maker = models.new_sessionmaker(app.engine)
app.jwt_manager = JWTManager(app)


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
