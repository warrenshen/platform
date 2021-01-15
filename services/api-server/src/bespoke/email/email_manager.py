# -*- coding: utf-8 -*-
"""
Implements EmailSender, simple abstraction on top of SendGrid python library
for sending emails.
"""

from __future__ import absolute_import
from __future__ import print_function

import smtplib
import logging
import boto3

from typing import Any, List, Text, Tuple, Union, Dict
from mypy_extensions import TypedDict

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Union, List, Optional
from concurrent.futures import ThreadPoolExecutor, Future

# sendgrid does not have type stubs as of now, hence type: ignore
# (see https://github.com/sendgrid/sendgrid-python/issues/956)
from sendgrid.sendgrid import SendGridAPIClient  # type: ignore
from sendgrid.helpers.mail import Email, Content, Mail, To  # type: ignore


def create_email_template(title: str, msg: str) -> str:
  email_template = u'''<div style="width:100%; font-size:14px; font-family: sans-serif,proxima_nova,'Open Sans','lucida grande','Segoe UI',arial,verdana,'lucida sans unicode',tahoma;">
	<div style="width:100%; background: #fff; margin: 0 auto; text-align: left;">
	<div style="width: 100%; padding: 20px; margin-top: 20px; margin-bottom: 20px; display: inline-block; vertical-align: top;">
	<div style="width: 100%;">
	<img src="favicon.png" style="background-size: 50px 50px; width: 50px; height: 50px; display: inline-block; margin: 0 auto; vertical-align:middle;">
	<span style="font-size: 22px;">&nbsp;&nbsp;Bespoke Financial</span>
	</div>
	<div style="width: 100%">
	<span style="width: 100%; display: block; height: 1px; border: 0; border-top: 1px solid; margin: 16px 0px; padding: 0; border-color: #efefef; "></span>
	<p style="font-size: 20px; font-family: sans-serif,proxima_nova,'Open Sans','lucida grande','Segoe UI',arial,verdana,'lucida sans unicode',tahoma; font-weight: 100;">{title}</p>
	<p>{msg}</p>
	<br />
	Thanks,
	<br />
	The Bespoke Team
	</div>
	</div>
	</div>
	</div>'''
  return email_template.format(title=title, msg=msg)


def _create_mime_message(from_addr: str, to_addr_list: List[str], subject: str, msg_body: str) -> MIMEMultipart:
  msg = MIMEMultipart('alternative')  # type: Any
  msg['From'] = u'Bespoke <{0}>'.format(from_addr)
  msg['To'] = u",".join(to_addr_list)
  msg['Subject'] = subject

  part1 = MIMEText(msg_body, 'plain')
  part2 = MIMEText(msg_body, 'html')
  msg.attach(part1)
  msg.attach(part2)
  return msg

SendGridConfigDict = TypedDict('SendGridConfigDict', {
  'api_key': str
})

EmailConfigDict = TypedDict(
	'EmailConfigDict', {
		'email_provider': str,
		'from_addr': Text,
		'sendgrid_config': SendGridConfigDict
	})

EmailDestination = Union[str, List[str]]
SendResponse = Union[int, Future]

class EmailClient(object):

	def send(
		self,
		*,
		to_: EmailDestination,
		subject: str,
		async_: bool = False,
		content: str,
		content_type: str = "text/plain",
	) -> Optional[Future]:
		pass

	def send_dynamic_email_template(
	  self, to_: EmailDestination, template_id: str, 
	  template_data: Dict, async_:bool=False) -> Optional[Future]:
		pass

class EmailSender(EmailClient):
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

	def __init__(self, api_key: str, from_: str, *, max_workers: int = 2):
		"""
		:param api_key: SendGrid API key obtained from SendGrid account.
		:param from_:
			Email address used as source of send email. Can be both plain email
			address of in fom "Example Name <example@example.com>".
		:param max_workers: Max number of thread workers for async mode.
		"""
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
		if isinstance(to_, str):
			to_ = To(to_)
		else:
			to_ = [To(t) for t in to_]

		content = Content(content_type, content)

		mail = Mail(self._from, to_, subject, content)
		if async_:
			return self._thread_pool.submit(self._send_email, mail)

		# not async call, execute it right away
		self._send_email(mail)
		return None

	def send_dynamic_email_template(
	  self, to_: EmailDestination, template_id: str, 
	  template_data: Dict, async_:bool=False) -> Optional[Future]:
		# template_data: Dict, async: bool = False) -> None:
		if isinstance(to_, str):
			to_ = [To(to_)]
		else:
			to_ = [To(t) for t in to_]

		mail = Mail(from_email=self._from, to_emails=to_)
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

def new_client(config: EmailConfigDict) -> EmailClient:
	email_provider = config['email_provider']
	if email_provider == 'sendgrid':
		api_key = config['sendgrid_config']['api_key']
		from_addr = config['from_addr']
		return EmailSender(api_key, from_addr)

	raise Exception('Unsupported email provided {}'.format(email_provider))
