current_dir=$(shell pwd)
project_dir=$(current_dir)/../..
server_root_dir=$(current_dir)

CUSTOMER_REPORTS_SCRIPT=bespoke/scripts/run_customer_reports.py
RUN_BALANCES_SCRIPT=bespoke/scripts/run_customer_balances.py
PYTHONPATH=$(server_root_dir)/src

update-requirements:
	pip-compile requirements.in --output-file=requirements.txt

# Example of running a file of tests:
# make run-test-local NAME=unit.bespoke.finance.test_contract_util
# Example of running a single test in a file of tests:
# make run-test-local NAME=unit.bespoke.finance.test_contract_util.TestContractHelper.test_missing_start_date

ifdef NAME
run-test-local:
	cd test && FLASK_ENV=development SERVER_ROOT_DIR=$(server_root_dir) PYTHONPATH=$(current_dir)/src python3 -m unittest $(NAME)
else
run-test-local:
	cd test && FLASK_ENV=development SERVER_ROOT_DIR=$(server_root_dir) PYTHONPATH=$(current_dir)/src python3 -m unittest discover .
endif

runlocal:
	cd src && FLASK_ENV=development PYTHONPATH=$(PYTHONPATH) SERVER_ROOT_DIR=$(server_root_dir) gunicorn --reload --bind 0.0.0.0:7000 --timeout 300 --threads 4 manage:app

run-async-local:
	cd src && FLASK_ENV=development PYTHONPATH=$(PYTHONPATH) SERVER_ROOT_DIR=$(server_root_dir) gunicorn --reload --bind 0.0.0.0:7001 --timeout 300 --threads 2 manage_async:app

# Scripts

run-customer-reports:
	cd src && PYTHONPATH=$(PYTHONPATH) SERVER_ROOT_DIR=$(server_root_dir) python3 $(CUSTOMER_REPORTS_SCRIPT)

run-customer-balances:
	cd src && PYTHONPATH=$(PYTHONPATH) SERVER_ROOT_DIR=$(server_root_dir) python3 $(RUN_BALANCES_SCRIPT)

run-metrc-script:
	cd src && PYTHONPATH=$(PYTHONPATH) SERVER_ROOT_DIR=$(server_root_dir) python3 bespoke/metrc/metrc_util.py

# For testing

runshell:
	cd src && FLASK_ENV=development PYTHONPATH=$(PYTHONPATH) SERVER_ROOT_DIR=$(server_root_dir) python3

setup-db:
	cd src && PROJECT_DIR=$(project_dir) PYTHONPATH=$(PYTHONPATH) python3 bespoke/db/main.py setup

# For mypy

mypy:
	MYPYPATH=stubs mypy src/bespoke/db/main.py --config-file=mypy.ini
	MYPYPATH=stubs mypy src/manage.py --config-file=mypy.ini
	MYPYPATH=stubs mypy src/manage_async.py --config-file=mypy.ini
	MYPYPATH=stubs mypy src/$(CUSTOMER_REPORTS_SCRIPT) --config-file=mypy.ini
	MYPYPATH=stubs mypy src/$(RUN_BALANCES_SCRIPT) --config-file=mypy.ini

mypy-tests:
	MYPYPATH=stubs:$(PYTHONPATH) mypy test/unit --config-file=mypy.ini
