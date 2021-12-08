import json
import os
from typing import Dict

from bespoke.config.config_util import (
	is_prod_env, is_development_env, is_test_env, 
	MetrcWorkerConfig, FCSConfigDict)
from bespoke.config import config_util
from bespoke.email import email_manager
from bespoke.email.email_manager import EmailConfigDict, EmailSender, SendGridConfigDict
from bespoke.security import security_util


def _string_to_bool(text: str) -> bool:
	if not text:
		return False
	return text.lower() == 'true'

class Config(object):

	def __init__(self) -> None:
		# JWT / Auth
		# https://flask-jwt-extended.readthedocs.io/en/stable/options/#configuration-options
		jwt_config = json.loads(os.environ.get('HASURA_GRAPHQL_JWT_SECRET', '{}'))
		self.JWT_SECRET_KEY = jwt_config['key'] if 'key' in jwt_config else None
		self.JWT_ALGORITHM = jwt_config['type'] if 'type' in jwt_config else None
		self.JWT_IDENTITY_CLAIM = 'https://hasura.io/jwt/claims'
		self.JWT_ACCESS_TOKEN_EXPIRES = 60 * 15  # 15 minutes in seconds (default)
		self.JWT_REFRESH_TOKEN_EXPIRES = 60 * 60 * 24 * 30  # 30 days in seconds (default)
		self.JWT_BLACKLIST_ENABLED = True
		self.JWT_BLACKLIST_TOKEN_CHECKS = ['access', 'refresh']

		# DB:
		# DATABASE_URL
		# DB_MAX_OVERFLOW
		# DB_POOL_SIZE

		# General
		self.FLASK_ENV = os.environ.get('FLASK_ENV')
		self.IS_TEST_ENV = self.FLASK_ENV == 'test' or _string_to_bool(os.environ.get('IS_TEST_ENV'))

		# Security
		self.PASSWORD_SALT = os.environ.get('PASSWORD_SALT')
		self.URL_SALT = os.environ.get('URL_SALT')
		self.URL_SECRET_KEY = os.environ.get('URL_SECRET_KEY')

		self.EMAIL_PROVIDER = os.environ.get('EMAIL_PROVIDER', 'sendgrid')

		# Email
		if is_development_env(self.FLASK_ENV):
			self.NO_REPLY_EMAIL_ADDRESS = 'do-not-reply-development@bespokefinancial.com'
		else:
			self.NO_REPLY_EMAIL_ADDRESS = os.environ.get(
				'NO_REPLY_EMAIL_ADDRESS',
				config_util.BESPOKE_NO_REPLY_EMAIL_ADDRESS)

		# List of emails reviewed by Bespoke Financial's operations team.
		bank_notify_email_addresses_str = os.environ.get('BANK_NOTIFY_EMAIL_ADDRESSES', '')
		self.BANK_NOTIFY_EMAIL_ADDRESSES = list(map(lambda s: s.strip(), bank_notify_email_addresses_str.split(','))) if bank_notify_email_addresses_str else []

		# List of emails reviewed by development team of this App.
		self.OPS_EMAIL_ADDRESSES = list(map(
			lambda s: s.strip(),
			os.environ.get('OPS_EMAIL_ADDRESSES', config_util.BESPOKE_OPS_EMAIL_ADDRESS).split(',')))

		self.DONT_SEND_OPS_EMAILS = bool(int(os.environ.get('DONT_SEND_OPS_EMAILS', '0')))

		self.SUPPORT_EMAIL_ADDRESS = os.environ.get(
			'SUPPORT_EMAIL_ADDRESS', 'support@bespokefinancial.com')
		self.SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
		self.TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
		self.TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
		self.TWILIO_FROM_NUMBER = os.environ.get('TWILIO_FROM_NUMBER')
		self.BESPOKE_DOMAIN = os.environ.get(
			'BESPOKE_DOMAIN', 'http://localhost:3005')

		# Metrc
		self.METRC_USER_KEY = os.environ.get('METRC_USER_KEY')

		# FCS
		self.FCS_USE_PROD = _string_to_bool(os.environ.get('FCS_USE_PROD'))
		self.FCS_CLIENT_ID = os.environ.get('FCS_CLIENT_ID')
		self.FCS_CLIENT_SECRET = os.environ.get('FCS_CLIENT_SECRET')
		self.FCS_USERNAME = os.environ.get('FCS_USERNAME')
		self.FCS_PASSWORD = os.environ.get('FCS_PASSWORD')

		# Files
		self.S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')

		# Logging
		self.SENTRY_DSN = os.environ.get('SENTRY_DSN')

		# Async Server
		self.ASYNC_SERVER_API_KEY = os.environ.get("ASYNC_SERVER_API_KEY", "ASYNC-SERVER-API-KEY-1085093607")

		# Diagnostics
		self.SERVER_TYPE = "api"

		# Base App URL per environment
		self.PROD_DOMAIN = os.environ.get('PROD_DOMAIN', 'https://app.bespokefinancial.com')
		self.TEST_DOMAIN = os.environ.get('TEST_DOMAIN', 'https://bespoke-app-staging.herokuapp.com')
		self.DEV_DOMAIN = os.environ.get('DEV_DOMAIN', 'http://localhost:3005')

	def get_security_config(self) -> security_util.ConfigDict:
		return security_util.ConfigDict(
			URL_SECRET_KEY=self.URL_SECRET_KEY,
			URL_SALT=self.URL_SALT,
			BESPOKE_DOMAIN=self.BESPOKE_DOMAIN
		)

	def get_metrc_worker_config(self) -> MetrcWorkerConfig:
		return MetrcWorkerConfig(
			num_parallel_licenses=1,
			num_parallel_sales_transactions=1,
			force_fetch_missing_sales_transactions=False
		)

	def get_metrc_auth_provider(self) -> config_util.MetrcAuthProvider:
		return config_util.get_metrc_auth_provider()

	def get_fcs_config(self) -> FCSConfigDict:
		return FCSConfigDict(
			use_prod=self.FCS_USE_PROD,
			client_id=self.FCS_CLIENT_ID,
			client_secret=self.FCS_CLIENT_SECRET,
			username=self.FCS_USERNAME,
			password=self.FCS_PASSWORD
		)

	def is_not_prod_env(self) -> bool:
		return not is_prod_env(self.FLASK_ENV)

	def is_development_env(self) -> bool:
		return is_development_env(self.FLASK_ENV)

	def is_test_env(self) -> bool:
		return is_test_env(self.FLASK_ENV)

	def is_prod_env(self) -> bool:
		return is_prod_env(self.FLASK_ENV)

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

def get_email_client_config(config: Config) -> EmailConfigDict:
	email_config = EmailConfigDict(
		email_provider=config.EMAIL_PROVIDER,
		from_addr=config.NO_REPLY_EMAIL_ADDRESS,
		support_email_addr=config.SUPPORT_EMAIL_ADDRESS,
		sendgrid_config=SendGridConfigDict(
			api_key=config.SENDGRID_API_KEY
		),
		flask_env=config.FLASK_ENV,
		no_reply_email_addr=config.NO_REPLY_EMAIL_ADDRESS,
		ops_email_addresses=config.OPS_EMAIL_ADDRESSES,
		bank_notify_email_addresses=config.BANK_NOTIFY_EMAIL_ADDRESSES,
	)
	return email_config
