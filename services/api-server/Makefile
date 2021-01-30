current_dir=$(shell pwd)
project_dir=$(current_dir)/../..
server_root_dir=$(current_dir)

CUSTOMER_REPORTS_SCRIPT=bespoke/scripts/run_customer_reports.py
PYTHONPATH=$(server_root_dir)/src

update-requirements:
	pip-compile requirements.in --output-file=requirements.txt

run-test-local:
	cd test && PYTHONPATH=$(current_dir)/src python3 -m unittest discover .

runlocal:
	cd src && FLASK_ENV=development PYTHONPATH=$(PYTHONPATH) SERVER_ROOT_DIR=$(server_root_dir) gunicorn --reload --bind 0.0.0.0:7000 --timeout 300 --threads 4 manage:app

# Scripts

run-customer-reports:
	cd src && PYTHONPATH=$(PYTHONPATH) SERVER_ROOT_DIR=$(server_root_dir) python3 $(CUSTOMER_REPORTS_SCRIPT)

# For testing

runshell:
	cd src && FLASK_ENV=development PYTHONPATH=$(PYTHONPATH) SERVER_ROOT_DIR=$(server_root_dir) python3

setup-db:
	cd src && PROJECT_DIR=$(project_dir) PYTHONPATH=$(PYTHONPATH) python3 bespoke/db/main.py setup

# For mypy

mypy:
	MYPYPATH=stubs mypy src/bespoke/db/main.py --config-file=mypy.ini
	MYPYPATH=stubs mypy src/manage.py --config-file=mypy.ini
	MYPYPATH=stubs mypy src/$(CUSTOMER_REPORTS_SCRIPT) --config-file=mypy.ini