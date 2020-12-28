import logging
import os
import json

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_script import Manager
from flask_jwt_extended import JWTManager
from typing import Dict

from bespoke.db import models
from server.views import auth

if os.environ.get('FLASK_ENV') == 'development':
  load_dotenv(os.path.join(os.environ.get('PROJECT_DIR'), '.env'))

logging.basicConfig(format='%(asctime)s [%(levelname)s] - %(message)s',
                    datefmt='%m/%d/%Y %H:%M:%S',
                    level=logging.INFO)

config = dict() # type: Dict

app = Flask(__name__)
CORS(app)
manager = Manager(app)
app.config.update(config)
jwt_config = json.loads(os.environ.get('HASURA_GRAPHQL_JWT_SECRET'))
app.config['JWT_SECRET_KEY'] = jwt_config["key"]
app.config['JWT_ALGORITHM'] = jwt_config["type"]

app.register_blueprint(auth.handler, url_prefix='/auth')

app.engine = models.create_engine()
app.session_maker = models.new_sessionmaker(app.engine)
app.jwt_manager = JWTManager(app)

if __name__ == '__main__':
	manager.run()