import json
import os

from typing import Dict
from bespoke.security import security_util

def _string_to_bool(text: str) -> bool:
  return text.lower() == 'true'


def is_development_env(flask_env: str) -> bool:
	return flask_env == 'development'

class Config(object):

	def __init__(self) -> None:
		# JWT / Auth
		# https://flask-jwt-extended.readthedocs.io/en/stable/options/#configuration-options
		jwt_config = json.loads(os.environ.get('HASURA_GRAPHQL_JWT_SECRET'))
		self.JWT_SECRET_KEY = jwt_config['key']
		self.JWT_ALGORITHM = jwt_config['type']
		self.JWT_IDENTITY_CLAIM = 'https://hasura.io/jwt/claims'
		self.JWT_ACCESS_TOKEN_EXPIRES = 60 * 15 # 15 minutes in seconds (default)
		self.JWT_REFRESH_TOKEN_EXPIRES = 60 * 60 * 24 * 30 # 30 days in seconds (default)
		self.JWT_BLACKLIST_ENABLED = True
		self.JWT_BLACKLIST_TOKEN_CHECKS = ['access', 'refresh']

		# General
		self.FLASK_ENV = os.environ.get('FLASK_ENV')

		# Security
		self.PASSWORD_SALT = os.environ.get('PASSWORD_SALT')
		self.URL_SALT = os.environ.get('URL_SALT')
		self.URL_SECRET_KEY = os.environ.get('URL_SECRET_KEY')

		self.EMAIL_PROVIDER = os.environ.get('EMAIL_PROVIDER', 'sendgrid')

		# Email
		self.NO_REPLY_EMAIL_ADDRESS = os.environ.get(
			'NO_REPLY_EMAIL_ADDRESS', 'do-not-reply@bespokefinancial.com')
		if is_development_env(self.FLASK_ENV):
			self.NO_REPLY_EMAIL_ADDRESS = 'do-not-reply-development@bespokefinancial.com'

		self.SUPPORT_EMAIL_ADDRESS = os.environ.get(
			'SUPPORT_EMAIL_ADDRESS', 'support@bespokefinancial.com')
		self.SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
		self.BESPOKE_DOMAIN = os.environ.get('BESPOKE_DOMAIN', 'http://localhost:3005')

		# Files
		self.S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')

		# Logging
		self.SENTRY_DSN = os.environ.get('SENTRY_DSN')

	def get_security_config(self) -> security_util.ConfigDict:
		return security_util.ConfigDict(
			URL_SECRET_KEY=self.URL_SECRET_KEY,
			URL_SALT=self.URL_SALT,
			BESPOKE_DOMAIN=self.BESPOKE_DOMAIN
		)

	def is_development_env(self) -> bool:
		return is_development_env(self.FLASK_ENV)

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