from typing import List, Union, Dict

class Email(object):

	def __init__(self, val: str) -> None:
		pass

class To(object):

	def __init__(self, val: str) -> None:
		pass

class Content(object):

	def __init__(self, content_type: str, content: str) -> None:
		pass

class Mail(object):

	def __init__(self, from_email: Email, to_emails: Union[To, List[To]], 
							 subject: str = None, content: Content = None) -> None:
		self.dynamic_template_data: Dict = None
		self.template_id: str = None