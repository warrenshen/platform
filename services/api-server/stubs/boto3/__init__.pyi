from typing import Dict, Any
from io import BytesIO

class Boto3Client(object):

	def generate_presigned_url(self, method: str, Params: Dict, ExpiresIn: int) -> str:
		pass

	def upload_fileobj(self, f: BytesIO, bucket_name: str, key_name: str) -> None:
		pass

def client(val: str, region_name: str, config: Any) -> Boto3Client:
	pass