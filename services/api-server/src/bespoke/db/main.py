import os
import sys

from bespoke.db import models
from bespoke.db.seed import setup_db_test
from dotenv import load_dotenv
from manage import app
from server.config import is_development_env, is_test_env

if is_test_env(os.environ.get('FLASK_ENV')):
	load_dotenv(os.path.join(os.environ.get('SERVER_ROOT_DIR'), '.env.test'))
elif is_development_env(os.environ.get('FLASK_ENV')):
	load_dotenv(os.path.join(os.environ.get('SERVER_ROOT_DIR'), '.env'))


def _setup_db() -> None:
	db_url = models.get_db_url()
	print('Setting up all tables with engine url {}'.format(db_url))
	db = models.create_engine()

	Session = models.new_sessionmaker(db)
	session = Session()

	models.Base.metadata.create_all(db)

	user = session.query(models.User).filter(
		models.User.email == "admin@bespoke.com").first()

	print(user.id)
	print(user.email)
	print(user.password)
	print(user.company_id)

	session.commit()


def _delete_db() -> None:
	db_url = models.get_db_url()
	print('Deleting all tables with engine url: {}'.format(db_url))
	engine = models.create_engine()

	models.User.__table__.drop(engine)
	models.PurchaseOrder.__table__.drop(engine)


def main() -> None:
	if sys.argv[1] == 'setup':
		_setup_db()
	elif sys.argv[1] == 'setup_test':
		setup_db_test(app)
	elif sys.argv[1] == 'delete_all':
		_delete_db()
	else:
		raise Exception(
			'Unreognized argument to db main.py {}'.format(sys.argv[1]))


if __name__ == '__main__':
	main()
