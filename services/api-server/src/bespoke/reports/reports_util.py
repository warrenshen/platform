import base64
import json
import os
import requests
import time
from typing import Dict
from flask import current_app
from bespoke.db import models
from sendgrid.helpers.mail import Attachment, FileContent, FileName, FileType, Disposition

from bespoke.config.config_util import is_prod_env

def prepare_email_attachment(
	company_name: str,
	statement_month: str,
	html: str,
	is_landscape: bool
	) -> Attachment:
	"""
		The attachment function returns a tuple to make testing easier
		In the cron / manual kickoff use case, we should not expect to use the returned html str
		In the unit test case, we want to test the str for html validation
	"""
	request_details : Dict[str, object] = {
		"html": html,
		"landscape": is_landscape
	}
	is_prod = is_prod_env(os.environ.get('FLASK_ENV'))
	pdf_endpoint = "https://bespoke-pdf-generator.herokuapp.com/pdf-generate" if is_prod is True else \
		"https://bespoke-pdf-generator-staging.herokuapp.com/pdf-generate"

	request_attempt_count = 0
	request_successful = False
	MAX_ATTEMPT_COUNT = 5
	while request_attempt_count < MAX_ATTEMPT_COUNT and request_successful is False:
		response = requests.post(
			pdf_endpoint, 
			data = json.dumps(request_details), # dumps needs for Bool -> bool (json) conversion
			headers = {
				"Content-Type": "application/json"
			}
		)

		request_attempt_count += 1

		if response.status_code == 503 and request_attempt_count < MAX_ATTEMPT_COUNT:
			time.sleep(1)
		elif response.status_code // 200 == 2: # all 2xx status codes are acceptable
			request_successful = True
		else:
			response.raise_for_status()

	encoded_file = base64.b64encode(response.content).decode()
	company_name = company_name.replace(" ", "-")
	while company_name.find("--") != -1:
		company_name = company_name.replace("--", "-")
	temp_pdf_name = f'{company_name}-{statement_month}-monthly_loc_customer_summary.pdf'
	final_pdf_name = f'{company_name}-{statement_month}-Summary-Report.pdf'
	attached_report = Attachment(
		FileContent(encoded_file),
		FileName(final_pdf_name),
		FileType("application/pdf"),
		Disposition("attachment")
	)

	return attached_report

def record_report_run_metadata(
	name: str,
	status: str,
	internal_state: Dict[str, object],
	params: Dict[str, object]
	) -> None:
	with models.session_scope(current_app.session_maker) as session:
		sync_pipeline_entry = models.SyncPipeline(
			name = name,
			status = status,
			internal_state = internal_state,
			params = params
		)
		session.add(sync_pipeline_entry)



