import json
import os

from typing import Dict

def _string_to_bool(text: str) -> bool:
  return text.lower() == 'true'

class Config(object):

	def __init__(self) -> None:
		jwt_config = json.loads(os.environ.get('HASURA_GRAPHQL_JWT_SECRET'))
		self.JWT_SECRET_KEY = jwt_config['key']
		self.JWT_ALGORITHM = jwt_config['type']
		self.JWT_IDENTITY_CLAIM = 'https://hasura.io/jwt/claims'

		self.EMAIL_PROVIDER = os.environ.get('EMAIL_PROVIDER', 'ses')

		# TODO(dlluncor): I think donotreply@bespokefinancial.com is better
		self.NO_REPLY_EMAIL_ADDRESS = os.environ.get(
			'NO_REPLY_EMAIL_ADDRESS', 'jira@bespokefinancial.com')
		self.USE_AWS_ACCESS_CREDS = _string_to_bool(
			os.environ.get('USE_AWS_ACCESS_CREDS', 'true'))
		self.SES_REGION_NAME = os.environ.get('SES_REGION_NAME', 'us-west-2')
		self.SES_ACCESS_KEY_ID = os.environ.get('SES_ACCESS_KEY_ID')
		self.SES_SECRET_ACCESS_KEY = os.environ.get('SES_SECRET_ACCESS_KEY')

		# TODO(dlluncor): Change this to a shorter value for production
		self.REFRESH_TOKEN_DURATION_MINUTES = 60 * 24
		self.ACCESS_TOKEN_DURATION_MINUTES = 60 * 24

	def as_dict(self) -> Dict:
	  attr_names = dir(self)
	  d = {}
	  for attr_name in attr_names:
	    if attr_name.startswith('__'):
	      continue
	    d[attr_name] = getattr(self, attr_name)
	  return d

def get_config() -> Config:
	return Config()