current_dir=$(shell pwd)
project_dir=$(current_dir)/../..

update-requirements:
	pip-compile requirements.in --output-file=requirements.txt

run-test-local:
	cd test && PYTHONPATH=$(current_dir)/src python3 -m unittest discover .

runlocal:
	cd src && FLASK_ENV=development PYTHONPATH=$(project_dir) PROJECT_DIR=$(project_dir) gunicorn --bind 0.0.0.0:7000 --timeout 300 --threads 4 manage:app

setup-db:
	cd src && PROJECT_DIR=$(project_dir) PYTHONPATH=$(current_dir)/src python3 bespoke/db/main.py setup
