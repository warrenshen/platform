import logging
import os

from dotenv import load_dotenv
from flask import Flask
from flask_script import Manager
from typing import Dict

from server.views import auth

load_dotenv(os.path.join(os.environ.get('PROJECT_DIR'), '.env'))
logging.basicConfig(format='%(asctime)s [%(levelname)s] - %(message)s',
                    datefmt='%m/%d/%Y %H:%M:%S',
                    level=logging.INFO)

config = dict() # type: Dict

app = Flask(__name__)
manager = Manager(app)
app.config.update(config)

app.register_blueprint(auth.handler, url_prefix='/auth')

#app.engine = models.create_engine()
#app.session_maker = models.new_sessionmaker(app.engine)

if __name__ == '__main__':
	manager.run()