current_dir=$(shell pwd)

update-requirements:
	pip-compile requirements.in --output-file=requirements.txt

run-test-local:
	cd test && PYTHONPATH=$(current_dir)/src python3 -m unittest discover .
