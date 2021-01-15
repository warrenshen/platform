current_dir=$(shell pwd)
project_dir=$(current_dir)/../..
server_root_dir=$(current_dir)

update-requirements:
	pip-compile requirements.in --output-file=requirements.txt

run-test-local:
	cd test && PYTHONPATH=$(current_dir)/src python3 -m unittest discover .

runlocal:
	cd src && FLASK_ENV=development PYTHONPATH=$(project_dir) SERVER_ROOT_DIR=$(server_root_dir) gunicorn --reload --bind 0.0.0.0:7000 --timeout 300 --threads 4 manage:app

runshell:
	cd src && FLASK_ENV=development PYTHONPATH=$(project_dir) SERVER_ROOT_DIR=$(server_root_dir) python3

setup-db:
	cd src && PROJECT_DIR=$(project_dir) PYTHONPATH=$(current_dir)/src python3 bespoke/db/main.py setup

mypy:
	MYPYPATH=stubs mypy src/bespoke/db/main.py --config-file=mypy.ini
	MYPYPATH=stubs mypy src/manage.py --config-file=mypy.ini