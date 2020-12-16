import logging
import os

from dotenv import load_dotenv
from flask import Flask
from flask_script import Manager
from flask_jwt_extended import JWTManager
from typing import Dict

from bespoke.db import models
from server.views import auth

load_dotenv(os.path.join(os.environ.get('PROJECT_DIR'), '.env'))
logging.basicConfig(format='%(asctime)s [%(levelname)s] - %(message)s',
                    datefmt='%m/%d/%Y %H:%M:%S',
                    level=logging.INFO)

config = dict() # type: Dict

app = Flask(__name__)
manager = Manager(app)
app.config.update(config)
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string'

app.register_blueprint(auth.handler, url_prefix='/auth')

app.engine = models.create_engine()
app.session_maker = models.new_sessionmaker(app.engine)
app.jwt_manager = JWTManager(app)


if __name__ == '__main__':
	manager.run()