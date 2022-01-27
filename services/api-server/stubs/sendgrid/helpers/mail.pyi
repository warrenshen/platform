from typing import List, Union, Dict, Optional

class Email(object):

	def __init__(self, val: str) -> None:
		pass

class To(object):

	def __init__(self, val: str) -> None:
		pass

class Content(object):

	def __init__(self, content_type: str, content: str) -> None:
		pass

class FileContent(object):

	def __init__(self, file_content: str) -> None:
		pass

class FileName(object):

	def __init__(self, file_name: str) -> None:
		pass

class FileType(object):

	def __init__(self, file_type: str) -> None:
		pass

class Disposition(object):

	def __init__(self, disposition: str) -> None:
		pass

class ContentId(object):

	def __init__(self, content_id: str) -> None:
		pass

class Attachment(object):

	def __init__(self,  file_content: FileContent, file_name: FileName, file_type: Optional[FileType] = None,
		disposition: Optional[Disposition] = None, content_id: Optional[ContentId] = None) -> None:
		pass

class Personalization(object):

	def __init__(self) -> None:
		pass

	def add_to(self, email: Email) -> None:
		pass

	def add_cc(self, email: Email) -> None:
		pass

class Mail(object):

	def __init__(self, from_email: Email, to_emails: Union[To, List[To]], 
							 subject: str = None, content: Content = None,
							 attachment: Attachment = None) -> None:
		self.dynamic_template_data: Dict = None
		self.template_id: str = None
		self.attachment: Attachment = None

	def add_personalization(self, personalization: Personalization, index: int = 0) -> None:
		pass

class Substitution(object):

	def __init__(self, key: str = None, value: str = None, p: Personalization = None) -> None:
		pass
