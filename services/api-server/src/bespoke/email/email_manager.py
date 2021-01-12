# -*- coding: utf-8 -*-
from __future__ import absolute_import
from __future__ import print_function

import smtplib
import logging
import boto3

from typing import Any, List, Text, Tuple, Union
from mypy_extensions import TypedDict

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

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

EmailConfigDict = TypedDict(
    'EmailConfigDict', {
        'email_provider': str,
        'from_addr': Text
    })


class EmailClient(object):

  def send_email(self, to_addr_list: List[str], subject: str, msg_body: str) -> None:
    raise NotImplementedError(u'send_email not implemented')

class SESClient(EmailClient):

  def __init__(self, ses_client: Any, from_addr: str) -> None:
    self._ses_client = ses_client
    self._from_addr = from_addr

  def _send_email(self, to_addr_list: List[str], subject: str, msg_body: str) -> None:
    msg = _create_mime_message(self._from_addr, to_addr_list, subject,
                               msg_body)

    val = self._ses_client.send_raw_email(
        Source=self._from_addr,
        Destinations=to_addr_list,
        RawMessage={'Data': msg.as_string()})

  def send_email(self, to_addr: List[str], subject: str, msg_body: str) -> None:
    self._send_email(to_addr, subject, msg_body)

def new_client(config: EmailConfigDict) -> EmailClient:
  email_provider = config['email_provider']
  raise Exception('Unsupported email provided {}'.format(email_provider))
