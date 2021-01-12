import os
import sys

from dotenv import load_dotenv

load_dotenv(os.path.join(os.environ.get('SERVER_ROOT_DIR'), '.env'))

from bespoke.db import models
 
def _setup_db() -> None:
	db_url = models.get_db_url()
	print('Setting up all tables with engine url {}'.format(db_url))
	db = models.create_engine()
	
	Session = models.new_sessionmaker(db)
	session = Session()

	models.Base.metadata.create_all(db)

	user = session.query(models.User).filter(models.User.email == "admin@bespoke.com").first()
	print(user.id)
	print(user.email)
	print(user.password)
	print(user.company_id)

	# Create
	#job1 = models.Job(id='2020-05-18', email='david', params={}, info={'key1': 'val1'}, status={}, state_vars={})
	#session.add(job1)
	session.commit()

	# Read
	#jobs = session.query(models.Job)  
	#for job in jobs:  
	#    print(job.id)

	# Update
	#doctor_strange.title = "Some2016Film"  
	#session.commit()

	# Delete
	#session.delete(doctor_strange)  
	#session.commit()

def _delete_db() -> None:
	db_url = models.get_db_url()
	print('Deleting all tables with engine url: {}'.format(db_url))
	engine = models.create_engine()

	models.User.__table__.drop(engine)
	models.Customer.__table__.drop(engine)
	models.PurchaseOrder.__table__.drop(engine)


def main() -> None:
	if sys.argv[1] == 'setup':
		_setup_db()
	elif sys.argv[1] == 'delete_all':
		_delete_db()
	else:
		raise Exception('Unreognized argument to db main.py {}'.format(sys.argv[1]))


if __name__ == '__main__':
	main()

