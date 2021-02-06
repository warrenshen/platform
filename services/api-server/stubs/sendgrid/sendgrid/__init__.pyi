from sendgrid.helpers.mail import Mail
from requests.models import Response

class SendGridAPIClient(object):

	def __init__(self, api_key: str = None) -> None:
		pass

	def send(self, mail: Mail) -> Response:
		pass