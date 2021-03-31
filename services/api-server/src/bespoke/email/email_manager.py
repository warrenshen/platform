# -*- coding: utf-8 -*-
"""
Implements EmailSender, simple abstraction on top of SendGrid python library
for sending emails.
"""

from __future__ import absolute_import, print_function

import logging
import smtplib
from concurrent.futures import Future, ThreadPoolExecutor
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any, Dict, List, Optional, Tuple, Union, cast

import boto3
from mypy_extensions import TypedDict
from sendgrid.helpers.mail import Content, Email, Mail, To
from sendgrid.sendgrid import SendGridAPIClient

SendGridConfigDict = TypedDict('SendGridConfigDict', {
	'api_key': str
})

EmailConfigDict = TypedDict(
	'EmailConfigDict', {
		'email_provider': str,
		'from_addr': str,
		'support_email_addr': str,
		'sendgrid_config': SendGridConfigDict,
		'flask_env': str,
		'no_reply_email_addr': str
	})

EmailDestination = Union[str, List[str]]
SendResponse = Union[int, Future]


class EmailSender(object):
	"""
	EmailSender provides simple interface for sending emails via SendGrid.
	Once class is instantiated, only single method is exposed: `send`.
	In order to create a class instance, API key is required and "from"
	email address. It can be simple email address or in form
	"Example Name <example@example.com>". This email address has to be added
	to SendGrid console and verified (or entire domain should be verified).
	Since class supports async execution (where caller does not have to wait
	for SendGrid to be contacted), `max_workers` parameter limits number of
	threads that do the waiting.
	"""

	def __init__(self, config: EmailConfigDict, max_workers: int = 2):
		"""
		:param api_key: SendGrid API key obtained from SendGrid account.
		:param from_:
				Email address used as source of send email. Can be both plain email
				address of in fom "Example Name <example@example.com>".
		:param max_workers: Max number of thread workers for async mode.
		"""
		api_key = config['sendgrid_config']['api_key']
		from_ = config['from_addr']

		self.config = config
		self._from = Email(from_)
		self._client = SendGridAPIClient(api_key=api_key)
		self._thread_pool = ThreadPoolExecutor(
			max_workers=max_workers, thread_name_prefix="email-sender"
		)

	def send(
			self,
			*,
			to_: EmailDestination,
			subject: str,
			async_: bool = False,
			content: str,
			content_type: str = "text/plain",
	) -> Optional[Future]:
		"""
		Sends email with provided parameters via SendGrid.
		Method has two modes of work sync and async. In sync mode, request will
		be sent to SendGrid and method will await for the response (which does
		not mean that email is delivered, or even sent, since email is
		inherently eventually consistent). It only means that SendGrid has
		received request to send an email.
		In async mode, after preparation, API call to send email will be done
		in an off-thread and control will be returned to caller right away. In
		that case, Future will be returned, which caller can use to verify
		if request was sent.
		In both cases, result of calling this method is None or raised
		EmailSendingException.
		:param to_:
				Email address or list of email addresses where email should be
				sent. Both simple email format and
				"Example Name <example@example.com>" formats are supported.
		:param subject: Subject line for email being sent
		:param async_:
				Flag indicating if email sending should be done async. If True,
				Future is returned.
		:param content: Content to be sent in an email.
		:param content_type: Content type of `content` parameter.
		:return:
		"""
		_to: Union[To, List[To]] = None
		if isinstance(to_, str):
			_to = To(cast(str, to_))
		else:
			_to = [To(t) for t in to_]

		content_ = Content(content_type, content)

		mail = Mail(self._from, _to, subject, content_)
		if async_:
			return self._thread_pool.submit(self._send_email, mail)

		# not async call, execute it right away
		self._send_email(mail)
		return None

	def send_dynamic_email_template(
			self, to_: EmailDestination, template_id: str,
			template_data: Dict, async_: bool = False) -> Optional[Future]:
		_to: Union[To, List[To]] = None
		if isinstance(to_, str):
			_to = [To(cast(str, to_))]
		else:
			_to = [To(t) for t in to_]

		mail = Mail(from_email=self._from, to_emails=_to)
		mail.dynamic_template_data = template_data
		mail.template_id = template_id

		if async_:
			return self._thread_pool.submit(self._send_email, mail)

		# not async call, execute it right away
		self._send_email(mail)
		return None

	def _send_email(self, email: Mail) -> None:
		"""
		Sends email and handlers error cases.
		:param email: Email to be sent.
		:return:
		"""
		try:
			resp = self._client.send(email)
			if resp.status_code != 202:
				raise EmailSendingException(
					f"email sending failed with non 200 status code, "
					f"got status code {resp.status_code}"
				)
		except Exception as e:
			raise EmailSendingException(
				f"email sending failed: {str(e)}"
			) from e


class EmailSendingException(Exception):
	"""
	Indicates error while sending an email.
	"""


def new_client(config: EmailConfigDict) -> EmailSender:
	return EmailSender(config)
