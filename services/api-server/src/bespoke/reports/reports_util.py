import base64
import json
import os
import requests
from typing import Dict
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
	response = requests.post(
		pdf_endpoint, 
		data = json.dumps(request_details), # dumps needs for Bool -> bool (json) conversion
		headers = {
			"Content-Type": "application/json"
		}
	)
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