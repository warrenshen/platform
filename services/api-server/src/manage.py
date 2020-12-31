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

config = dict()  # type: Dict

app = Flask(__name__)
CORS(app)
manager = Manager(app)

jwt_config = json.loads(os.environ.get('HASURA_GRAPHQL_JWT_SECRET'))
config['JWT_SECRET_KEY'] = jwt_config['key']
config['JWT_ALGORITHM'] = jwt_config['type']
config['JWT_IDENTITY_CLAIM'] = 'https://hasura.io/jwt/claims'

app.config.update(config)

app.register_blueprint(auth.handler, url_prefix='/auth')

app.engine = models.create_engine()
app.session_maker = models.new_sessionmaker(app.engine)
app.jwt_manager = JWTManager(app)

if __name__ == '__main__':
    manager.run()
