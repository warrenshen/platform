current_dir=$(shell pwd)
project_dir=$(current_dir)/../..
server_root_dir=$(current_dir)

CUSTOMER_REPORTS_SCRIPT=bespoke/scripts/run_customer_reports.py
RUN_BALANCES_SCRIPT=bespoke/scripts/run_customer_balances.py
PYTHONPATH=$(server_root_dir)/src

update-requirements:
	pip-compile requirements.in --output-file=requirements.txt

ifdef NAME
run-test-local:
	cd test && FLASK_ENV=development SERVER_ROOT_DIR=$(server_root_dir) PYTHONPATH=$(current_dir)/src python3 -m unittest $(NAME)
else
run-test-local:
	cd test && FLASK_ENV=development SERVER_ROOT_DIR=$(server_root_dir) PYTHONPATH=$(current_dir)/src python3 -m unittest discover .
endif

runlocal:
	cd src && FLASK_ENV=development PYTHONPATH=$(PYTHONPATH) SERVER_ROOT_DIR=$(server_root_dir) gunicorn --reload --bind 0.0.0.0:7000 --timeout 300 --threads 4 manage:app

run-cypress-local:
	cd src && FLASK_ENV=test PYTHONPATH=$(PYTHONPATH) SERVER_ROOT_DIR=$(server_root_dir) gunicorn --reload --bind 0.0.0.0:7002 --timeout 300 --threads 1 manage:app

run-async-local:
	cd src && FLASK_ENV=development PYTHONPATH=$(PYTHONPATH) SERVER_ROOT_DIR=$(server_root_dir) gunicorn --reload --bind 0.0.0.0:7001 --timeout 300 --threads 2 manage_async:app

# Scripts
run-metrc-script:
	cd src && PYTHONPATH=$(PYTHONPATH) SERVER_ROOT_DIR=$(server_root_dir) python3 bespoke/metrc/metrc_util.py

run-test-seed-db:
	cd src && FLASK_ENV=test PYTHONPATH=$(PYTHONPATH) SERVER_ROOT_DIR=$(server_root_dir) python3 bespoke/db/main.py setup_test

# For testing

runshell:
	cd src && FLASK_ENV=development PYTHONPATH=$(PYTHONPATH) SERVER_ROOT_DIR=$(server_root_dir) python3

setup-db:
	cd src && PROJECT_DIR=$(project_dir) PYTHONPATH=$(PYTHONPATH) python3 bespoke/db/main.py setup

# For mypy

mypy-scripts:
	MYPYPATH=stubs:src mypy scripts/analysis/compute_monthly_inventory.py --config-file=mypy.ini
	MYPYPATH=stubs:src mypy scripts/backfill/0085_add_company_deliveries.py --config-file=mypy.ini
		MYPYPATH=stubs:src mypy scripts/backfill/0086_delete_incorrect_metrc_rows.py --config-file=mypy.ini


mypy:
	MYPYPATH=stubs mypy src/bespoke/db/main.py --config-file=mypy.ini
	MYPYPATH=stubs mypy src/manage.py --config-file=mypy.ini
	MYPYPATH=stubs mypy src/manage_async.py --config-file=mypy.ini

mypy-tests:
	MYPYPATH=stubs:$(PYTHONPATH) mypy test/unit --config-file=mypy.ini
