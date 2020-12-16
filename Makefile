
update-requirements:
	cd services/api-server && $(MAKE) update-requirements

install-requirements:
	cd services/api-server && pip install -r requirements.txt

run-test-local:
	cd services/api-server && $(MAKE) run-test-local

run-api-server:
	cd services/api-server && $(MAKE) runlocal

mypy-all:
	mypy services/api-server/src/bespoke/db/models.py --config-file=mypy.ini
	mypy services/api-server/src/manage.py --config-file=mypy.ini

setup:
	pip3 install pip-tools==5.1.2

setup-for-mac:
	brew update
	brew upgrade
	brew install postgresql
	brew install node
	npm install -g yarn

setup-for-linux:
	echo 'You need to install postgresql on Linux'
	echo 'For example in Ubuntu, use this: `apt-get install -y libpq-dev python3-psycopg2`'
