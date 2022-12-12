from mypy_extensions import TypedDict
from typing import List

from bespoke.db.db_constants import MetrcLicenseCategoryDownloadStatus

BESPOKE_INTERNAL_ERROR_STATUS_CODE = -100 # some random number that won't be reused by an HTTP Response
AUTHORIZATION_ERROR_CODES = set([401, 403])

MetrcErrorDetailsDict = TypedDict('MetrcErrorDetailsDict', {
	'reason': str,
	'status_code': int,
	'traceback': str,
})

MetrcRetryParamsDict = TypedDict('MetrcRetryParamsDict', {
	'path': str,
	'time_range': List[str]
})

class MetrcRetryError(object):

	def __init__(self, retry_params: MetrcRetryParamsDict, err_details: MetrcErrorDetailsDict) -> None:
		self.retry_params = retry_params
		self.err_details = err_details

	def get_api_status(self) -> str:
		status_code = self.err_details['status_code']

		if status_code in AUTHORIZATION_ERROR_CODES:
			return MetrcLicenseCategoryDownloadStatus.NO_ACCESS

		if status_code == BESPOKE_INTERNAL_ERROR_STATUS_CODE:
			return MetrcLicenseCategoryDownloadStatus.BESPOKE_SERVER_ERROR

		return MetrcLicenseCategoryDownloadStatus.METRC_SERVER_ERROR

class ErrorCatcher(object):

	def __init__(self) -> None:
		self._retry_errors: List[MetrcRetryError] = []

	def add_retry_error(self, path: str, time_range: List[str], err_details: MetrcErrorDetailsDict) -> None:

		self._retry_errors.append(MetrcRetryError(
			MetrcRetryParamsDict(
				path=path,
				time_range=time_range
			),
			err_details=err_details,
		))

	def get_retry_errors(self) -> List[MetrcRetryError]:
		return self._retry_errors

