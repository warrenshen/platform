"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python po_attachment_gathering.py

1. Gather all purchase orders so we can collate the attachement locations
	- query purchase_order_files
		- make sure to batch
2. once you have all the file ids, hit the file tables, the s3 location is stored in the path column
		- use an "in" query with sqlalchemy
3. use boto's s3 functionality to grab the files
	- file names might overlap, probably worth renaming to <company_id>_<date>_original_name.pdf (or something like that)
4. zip up the pdfs
5. ask where to put it
"""

import os
import sys
import time
import boto3
from os import path
from typing import List, cast
from botocore.exceptions import ClientError
from dotenv import load_dotenv


# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from sqlalchemy.orm.session import Session
from bespoke.db import models, models_util


def main(is_test_run: bool = True):
	files_dir = "files"
	if os.path.isdir(files_dir) is False:
		os.mkdir(files_dir)
	load_dotenv(os.path.join("../..", '.env'))

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	company_lookup = {}
	with models.session_scope(session_maker) as session:
		companies = cast(
			List[models.Company],
			session.query(models.Company).all())

		for c in companies:
			company_lookup[str(c.id)] = c.name

	current_page = 0
	TRANSFER_BATCH_SIZE = 10
	is_done = False

	s3_files = []
	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Gathering purchase order file attachment locations...')

			try:
				po_files = cast(
					List[models.PurchaseOrderFile],
					session.query(models.PurchaseOrderFile).order_by(
						models.PurchaseOrderFile.purchase_order_id 
					).offset(
						current_page * TRANSFER_BATCH_SIZE
					).limit(TRANSFER_BATCH_SIZE).all())
			except Exception as e:
				print(e)
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			if len(po_files) <= 0:
				is_done = True
			else:
				file_ids = []
				for pof in po_files:
					file_ids.append(pof.file_id)

				files = cast(
					List[models.File],
					session.query(models.File).filter(
						models.File.id.in_(file_ids)
					).all())

				for f in files:
					file_dict = {}
					file_dict["id"] = str(f.id)
					file_dict["name"] = f.name
					file_dict["path"] = f.path
					file_dict["company_name"] = company_lookup[str(f.company_id)]
					s3_files.append(file_dict)

			current_page += 1

	s3_client = boto3.client('s3')
	bucket_name = "bespoke-platform-for-dev"

	for s3f in s3_files:
		local_dir_path = os.path.join("files", s3f["company_name"])
		if os.path.isdir(local_dir_path) is False:
			os.mkdir(local_dir_path)

		local_file_path = os.path.join("files", s3f["company_name"], s3f["id"] + s3f["name"])
		with open(local_file_path, 'wb') as f:
			print(s3f["path"])
			s3_client.download_fileobj(bucket_name, s3f["path"], f)

if __name__ == '__main__':
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	is_test_run = True

	if not os.environ.get("CONFIRM"):
		print("This script CHANGES information in the database")
		print("You must set 'CONFIRM=1' as an environment variable to actually perform database changes with this script")
	else:
		is_test_run = False

	main(is_test_run)