
_path_to_default_resp = {
  # Harvests
	'/harvests/v1/inactive': b'[]',
	'/harvests/v1/active': b'[]',
	'/harvests/v1/onhold': b'[]',

	'/packages/v1/active': b'[]',
	'/packages/v1/inactive': b'[]',
	'/packages/v1/onhold': b'[]',

	'/plantbatches/v1/active': b'[]',
	'/plantbatches/v1/inactive': b'[]',

	'/plants/v1/vegetative': b'[]',
	'/plants/v1/flowering': b'[]',
	'/plants/v1/inactive': b'[]',
	'/plants/v1/onhold': b'[]',

	'/sales/v1/receipts/inactive': b'[]',
	'/sales/v1/receipts/active': b'[]',

	'/transfers/v1/incoming': b'[]',
	'/transfers/v1/outgoing': b'[]',
}

class RetryHelper(object):

	def __init__(self, download_errors: List[models.MetrcDownloadError]) -> None:
		self._download_errors = download_errors
		self._key_to_download_error = {}

		for download_error in download_errors:
			retry_params = cast(MetrcRetryParamsDict, download_error.retry_params)
			key = (retry_params['path'], retry_params['time_range'])
			self._key_to_download_error[key] = True

	def _has_download_error(self, path: str, time_range: List[str]) -> bool:
		key = (path, tuple(time_range))
		if key in self._key_to_download_error:
			# We had a download error, so dont skip the retry of fetching this
			return False

		return True

	def should_skip_fetch(self, path: str, time_range: List[str]) -> bool:
		if self._has_download_error(path, time_range):
			return False

		if path not in _path_to_default_resp:
			# If it wasn't an error, but we don't have a default response,
			# don't skip this since it's probably a /sales/v1/receipts
			# or some kind of transfers API
			return False

		return True

	def get_dummy_default_response(self, path: str, time_range: List[str]) -> HTTPResponse:
		# Dont give dummy responses to these URLs because it will
		# make our metrc code write empty transactions, sales receipts, etc
		# 
		# instead, we just tell our code to skip this item since
		# it was run successfully in the previous run, e.g.,
		# it wasn't in the list of metrc download errors.
		if path not in _path_to_default_resp:		
			raise errors.Error('We should not be triggering a dummy default response for path {}'.format(path))

		content = _path_to_default_resp[path]
		resp = requests.models.Response()
		resp._content = content
		resp.status_code = 200
		return HTTPResponse(resp)

def get():
	if self._retry_helper.should_skip_fetch(path, time_range):
			return self._retry_helper.get_dummy_default_response(path, time_range)
