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

run-async-local-fast:
	cd src && FLASK_ENV=development PYTHONPATH=$(PYTHONPATH) SERVER_ROOT_DIR=$(server_root_dir) gunicorn --reload --bind 0.0.0.0:7003 --timeout 300 --threads 2 manage_async_fast:app

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

mypy-scripts:
	MYPYPATH=stubs:src mypy scripts/analysis/compute_monthly_inventory.py --config-file=mypy.ini
	MYPYPATH=stubs:src mypy scripts/backfill/0085_add_company_deliveries.py --config-file=mypy.ini
	MYPYPATH=stubs:src mypy scripts/batch/sync_metrc_data.py

mypy:
	MYPYPATH=stubs mypy src/bespoke/db/seed.py --config-file=mypy.ini
	MYPYPATH=stubs mypy src/bespoke/db/main.py --config-file=mypy.ini
	MYPYPATH=stubs mypy src/manage.py --config-file=mypy.ini
	MYPYPATH=stubs mypy src/manage_async.py --config-file=mypy.ini
	MYPYPATH=stubs mypy src/manage_async_fast.py --config-file=mypy.ini
	$(MAKE) mypy-scripts

mypy-tests:
	MYPYPATH=stubs:$(PYTHONPATH) mypy test/unit --config-file=mypy.ini

# code quality 

organize:
	find scripts src test -name "*.py" -type f -print0 | tr '\n' '\0' | xargs -0 -n1 isort
	find scripts src test -name "*.py" -type f -print0 | tr '\n' '\0' | xargs -0 -n1 add-trailing-comma --exit-zero-even-if-changed --py36-plus
	find scripts src test -name "*.py" -type f -print0 | tr '\n' '\0' | xargs -0 -n1 yapf --in-place --parallel

organize-check:
	find scripts src test -name "*.py" | tr '\n' '\0' | xargs -0 -n1 yapf --diff

find-unused-imports:
	find scripts src test -name "*.py" | tr '\n' '\0' | xargs -0 -n1 vulture | grep "unused import"
