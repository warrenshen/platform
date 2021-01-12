import json
import os

from typing import Dict

def _string_to_bool(text: str) -> bool:
  return text.lower() == 'true'

class Config(object):

	def __init__(self) -> None:
		# https://flask-jwt-extended.readthedocs.io/en/stable/options/#configuration-options
		jwt_config = json.loads(os.environ.get('HASURA_GRAPHQL_JWT_SECRET'))
		self.JWT_SECRET_KEY = jwt_config['key']
		self.JWT_ALGORITHM = jwt_config['type']
		self.JWT_IDENTITY_CLAIM = 'https://hasura.io/jwt/claims'
		self.JWT_ACCESS_TOKEN_EXPIRES = 60 * 15 # 15 minutes in seconds (default)
		self.JWT_REFRESH_TOKEN_EXPIRES = 60 * 60 * 24 * 30 # 30 days in seconds (default)
		self.JWT_BLACKLIST_ENABLED = True
		self.JWT_BLACKLIST_TOKEN_CHECKS = ['access', 'refresh']

		self.EMAIL_PROVIDER = os.environ.get('EMAIL_PROVIDER', 'ses')

		# TODO(dlluncor): I think donotreply@bespokefinancial.com is better
		self.NO_REPLY_EMAIL_ADDRESS = os.environ.get(
			'NO_REPLY_EMAIL_ADDRESS', 'jira@bespokefinancial.com')
		self.LOCALHOST = 'http://localhost:7000'
		
		# Files
		self.S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
		self.ENV_TYPE = os.environ.get('ENV_TYPE')

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